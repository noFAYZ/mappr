import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import type { Database } from '@/types/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversationId, context } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, tier')
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check rate limits
    const rateLimits = { free: 50, pro: 500, enterprise: -1 };
    
    if (rateLimits[profile.tier] !== -1) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: conversations } = await supabase
        .from('ai_conversations')
        .select('messages')
        .eq('user_id', profile.id)
        .gte('created_at', startOfMonth.toISOString());

      const totalMessages = conversations?.reduce((total, conv) => {
        const messages = Array.isArray(conv.messages) ? conv.messages : [];
        return total + messages.filter(msg => msg.role === 'user').length;
      }, 0) || 0;

      if (totalMessages >= rateLimits[profile.tier]) {
        return NextResponse.json({ 
          error: 'Rate limit exceeded',
          message: `You've reached your monthly limit of ${rateLimits[profile.tier]} AI queries.`
        }, { status: 429 });
      }
    }

    let conversation;
    
    if (conversationId) {
      const { data: existingConv } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', profile.id)
        .single();
      
      conversation = existingConv;
    }

    if (!conversation) {
      const { data: newConv, error: convError } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: profile.id,
          title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
          messages: []
        })
        .select()
        .single();

      if (convError) {
        return NextResponse.json({ error: convError.message }, { status: 500 });
      }
      
      conversation = newConv;
    }

    // Build real context
    const aiContext = await buildUserContext(supabase, profile.id);

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: message,
      timestamp: new Date().toISOString()
    };

    const currentMessages = Array.isArray(conversation.messages) ? conversation.messages : [];
    const updatedMessages = [...currentMessages, userMessage];

    // Call OpenAI
    const aiResponse = await callOpenAI(message, aiContext, updatedMessages);

    const assistantMessage = {
      id: crypto.randomUUID(),
      role: 'assistant' as const,
      content: aiResponse,
      timestamp: new Date().toISOString()
    };

    const finalMessages = [...updatedMessages, assistantMessage];

    await supabase
      .from('ai_conversations')
      .update({
        messages: finalMessages,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation.id);

    return NextResponse.json({
      conversationId: conversation.id,
      message: assistantMessage
    });

  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function buildUserContext(supabase: any, userId: string) {
  try {
    // Get user extensions
    const { data: userExtensions } = await supabase
      .from('user_extensions')
      .select(`
        connection_name,
        sync_status,
        last_sync_at,
        extensions (
          name,
          category,
          supported_data_types
        )
      `)
      .eq('user_id', userId)
      .eq('is_enabled', true);

    // Get portfolios
    const { data: portfolios } = await supabase
      .from('portfolios')
      .select(`
        name,
        description,
        is_default,
        portfolio_items (
          item_type,
          item_name,
          metadata
        )
      `)
      .eq('user_id', userId);

    // Get recent aggregated data summary
    const { data: recentData } = await supabase
      .from('aggregated_data')
      .select('data_type, created_at, metadata')
      .in('user_extension_id', userExtensions?.map(ue => ue.id) || [])
      .order('created_at', { ascending: false })
      .limit(20);

    // Calculate summary statistics
    const dataTypeCounts = recentData?.reduce((acc, item) => {
      acc[item.data_type] = (acc[item.data_type] || 0) + 1;
      return acc;
    }, {}) || {};

    return {
      connectedSources: userExtensions?.map(ue => ({
        name: ue.extensions?.name,
        category: ue.extensions?.category,
        status: ue.sync_status,
        lastSync: ue.last_sync_at,
        supportedTypes: ue.extensions?.supported_data_types
      })) || [],
      portfolios: portfolios?.map(p => ({
        name: p.name,
        description: p.description,
        isDefault: p.is_default,
        itemCount: p.portfolio_items?.length || 0,
        itemTypes: p.portfolio_items?.map(item => item.item_type) || []
      })) || [],
      dataActivity: {
        totalRecords: recentData?.length || 0,
        dataTypes: dataTypeCounts,
        lastUpdate: recentData?.[0]?.created_at || null
      }
    };
  } catch (error) {
    console.error('Error building context:', error);
    return { error: 'Failed to build context' };
  }
}

async function callOpenAI(message: string, context: any, messageHistory: any[]) {
  const systemPrompt = `You are a financial AI assistant for DataAggregator Pro. Help users analyze their financial data and provide insights.

CURRENT USER CONTEXT:
${context.connectedSources?.length > 0 ? `
Connected Data Sources (${context.connectedSources.length}):
${context.connectedSources.map(source => 
  `- ${source.name} (${source.category}) - Status: ${source.status}${source.lastSync ? `, Last sync: ${new Date(source.lastSync).toLocaleDateString()}` : ''}`
).join('\n')}
` : '- No data sources connected'}

${context.portfolios?.length > 0 ? `
Portfolios (${context.portfolios.length}):
${context.portfolios.map(portfolio => 
  `- ${portfolio.name}: ${portfolio.itemCount} items (${portfolio.itemTypes.join(', ')})`
).join('\n')}
` : '- No portfolios created'}

${context.dataActivity?.totalRecords > 0 ? `
Recent Data Activity:
- Total records: ${context.dataActivity.totalRecords}
- Data types: ${Object.entries(context.dataActivity.dataTypes).map(([type, count]) => `${type} (${count})`).join(', ')}
- Last update: ${context.dataActivity.lastUpdate ? new Date(context.dataActivity.lastUpdate).toLocaleDateString() : 'Unknown'}
` : '- No recent data activity'}

GUIDELINES:
1. Be helpful and provide actionable financial insights
2. If user lacks data, suggest specific extensions to connect
3. Reference their actual connected sources and portfolios
4. Provide specific, data-driven recommendations when possible
5. Be conversational but professional
6. If you can't provide analysis due to lack of data, explain what data is needed`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...messageHistory.slice(-10).map(msg => ({
      role: msg.role,
      content: msg.content
    }))
  ];

  const completion = await openai.chat.completions.create({
    model: process.env.AI_MODEL || 'gpt-4-turbo-preview',
    messages: messages as any,
    max_tokens: 1000,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content || 'I apologize, but I encountered an error generating a response.';
}

