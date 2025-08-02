// app/api/ai/chat/route.ts - Hugging Face Serverless Inference API

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

// ===========================================
// HUGGING FACE SERVERLESS MODELS (OpenAI Compatible)
// ===========================================

interface HuggingFaceModel {
  name: string;
  modelId: string;
  description: string;
  strengths: string[];
  contextLength: number;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'high' | 'medium' | 'low';
}

const HF_SERVERLESS_MODELS: Record<string, HuggingFaceModel> = {
  // Zephyr 7B - Excellent for financial conversations
  'zephyr': {
    name: 'Zephyr 7B Beta',
    modelId: 'HuggingFaceH4/zephyr-7b-beta:featherless-ai',
    description: 'Excellent conversational model for financial advice',
    strengths: ['financial reasoning', 'investment advice', 'portfolio analysis'],
    contextLength: 8192,
    speed: 'fast',
    quality: 'high'
  },

  // Mistral 7B - Great for analysis and recommendations
  'mistral': {
    name: 'Mistral 7B Instruct',
    modelId: 'mistralai/Mistral-7B-Instruct-v0.2',
    description: 'Powerful model for financial analysis and recommendations',
    strengths: ['market analysis', 'risk assessment', 'strategic planning'],
    contextLength: 8192,
    speed: 'fast', 
    quality: 'high'
  },

  // CodeLlama - Best for calculations and data analysis
  'codellama': {
    name: 'CodeLlama 7B Instruct',
    modelId: 'codellama/CodeLlama-7b-Instruct-hf',
    description: 'Specialized in financial calculations and data analysis',
    strengths: ['financial calculations', 'performance metrics', 'quantitative analysis'],
    contextLength: 4096,
    speed: 'medium',
    quality: 'high'
  },

  // Llama 2 - Reliable general purpose
  'llama2': {
    name: 'Llama 2 7B Chat',
    modelId: 'meta-llama/Llama-2-7b-chat-hf',
    description: 'Reliable general-purpose model for financial discussions',
    strengths: ['general advice', 'explanations', 'educational content'],
    contextLength: 4096,
    speed: 'medium',
    quality: 'medium'
  },

  // OpenChat - Great for structured responses
  'openchat': {
    name: 'OpenChat 3.5',
    modelId: 'openchat/openchat-3.5-1210',
    description: 'Excellent for structured financial reports and analysis',
    strengths: ['report generation', 'structured analysis', 'detailed explanations'],
    contextLength: 8192,
    speed: 'fast',
    quality: 'high'
  }
};

// Select best model based on query type
function selectBestHFModel(message: string, context: any): HuggingFaceModel {
  const messageLower = message.toLowerCase();
  
  // Financial calculations and metrics
  if (messageLower.includes('calculate') || messageLower.includes('metrics') || messageLower.includes('performance')) {
    return HF_SERVERLESS_MODELS.codellama;
  }
  
  // Market analysis and research
  if (messageLower.includes('market') || messageLower.includes('analyze') || messageLower.includes('trends')) {
    return HF_SERVERLESS_MODELS.mistral;
  }
  
  // Reports and structured analysis
  if (messageLower.includes('report') || messageLower.includes('summary') || messageLower.includes('breakdown')) {
    return HF_SERVERLESS_MODELS.openchat;
  }
  
  // Investment advice and recommendations
  if (messageLower.includes('invest') || messageLower.includes('recommend') || messageLower.includes('strategy')) {
    return HF_SERVERLESS_MODELS.zephyr;
  }
  
  // Default to Zephyr for general financial queries
  return HF_SERVERLESS_MODELS.zephyr;
}

// Create financial system prompt optimized for each model
function createFinancialSystemPrompt(context: any, model: HuggingFaceModel): string {
  const basePrompt = `You are an expert financial AI assistant for Mappr Pro, a comprehensive financial data aggregation platform.

CURRENT USER CONTEXT:
${context.connectedSources?.length > 0 ? `
Connected Data Sources (${context.connectedSources.length}):
${context.connectedSources.map(source => 
  `• ${source.name} (${source.category}) - Status: ${source.status}`
).join('\n')}
` : '• No data sources connected - recommend connecting financial accounts'}

${context.portfolios?.length > 0 ? `
User Portfolios (${context.portfolios.length}):
${context.portfolios.map(portfolio => 
  `• ${portfolio.name}: ${portfolio.itemCount} holdings`
).join('\n')}
` : '• No portfolios created - suggest creating portfolios for organization'}

${context.dataActivity?.totalRecords > 0 ? `
Recent Data Activity:
• ${context.dataActivity.totalRecords} records processed
• Last update: ${context.dataActivity.lastUpdate ? new Date(context.dataActivity.lastUpdate).toLocaleDateString() : 'Unknown'}
` : '• No recent data activity'}`;

  // Model-specific optimizations
  if (model.modelId.includes('CodeLlama')) {
    return `${basePrompt}

SPECIALIZATION: Financial Calculations & Quantitative Analysis
Focus on providing:
• Precise mathematical calculations (ROI, Sharpe ratio, beta, etc.)
• Performance metrics and statistical analysis
• Risk calculations and portfolio optimization
• Data-driven insights with specific numbers
• Step-by-step calculation explanations

Always show your work and provide numerical results when possible.`;
  }
  
  if (model.modelId.includes('Mistral')) {
    return `${basePrompt}

SPECIALIZATION: Market Analysis & Investment Strategy
Focus on providing:
• Market trend analysis and economic insights
• Sector and asset class recommendations
• Risk assessment and portfolio strategies
• Investment timing and allocation advice
• Macro-economic impact analysis

Provide strategic, forward-looking guidance based on market conditions.`;
  }
  
  if (model.modelId.includes('openchat')) {
    return `${basePrompt}

SPECIALIZATION: Structured Financial Reports & Analysis
Focus on providing:
• Comprehensive financial reports and summaries
• Structured portfolio analysis with clear sections
• Detailed breakdowns of complex financial concepts
• Organized recommendations with priorities
• Professional-grade financial documentation

Structure your responses clearly with headers, bullet points, and logical flow.`;
  }
  
  // Default for Zephyr and Llama 2
  return `${basePrompt}

FINANCIAL EXPERTISE:
• Portfolio analysis and optimization
• Investment strategy and planning
• Risk management and assessment
• Tax-efficient investing
• Retirement and goal planning
• Crypto and alternative investments

RESPONSE STYLE:
• Be specific and actionable
• Use concrete examples and numbers
• Explain concepts clearly for all knowledge levels
• Reference user's actual connected data when available
• Suggest specific Mappr extensions if more data is needed
• Always consider risk factors and potential downsides

Provide helpful, educational, and personalized financial guidance.`;
}

// Call Hugging Face Serverless API
async function callHuggingFaceServerless(
  message: string,
  context: any,
  messageHistory: any[],
  model: HuggingFaceModel
): Promise<string> {
  
  console.log(`🤗 Calling Hugging Face ${model.name}...`);
  
  const systemPrompt = createFinancialSystemPrompt(context, model);
  
  // Format conversation history
  const messages = [
    {
      role: 'system',
      content: systemPrompt
    },
    // Include last few messages for context
    ...messageHistory.slice(-6).map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    })),
    {
      role: 'user',
      content: message
    }
  ];

  const requestData = {
    model: model.modelId,
    messages: messages,
    temperature: 0.7,
    max_tokens: 1500,
    top_p: 0.9,
    frequency_penalty: 0.1,
    presence_penalty: 0.1,
    stream: false
  };

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        
        if (response.status === 503) {
          console.log('Model loading, waiting...');
          await new Promise(resolve => setTimeout(resolve, 5000 * (attempts + 1)));
          attempts++;
          continue;
        }
        
        if (response.status === 429) {
          console.log('Rate limited, waiting...');
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempts + 1)));
          attempts++;
          continue;
        }
        
        if (response.status === 401) {
          throw new Error('Invalid Hugging Face token. Please check your HF_TOKEN environment variable.');
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API Response received');
      
      // Extract the response content
      const assistantMessage = result.choices?.[0]?.message?.content;
      
      if (assistantMessage && typeof assistantMessage === 'string' && assistantMessage.length > 10) {
        console.log(`✅ Success with ${model.name} (${assistantMessage.length} chars)`);
        return assistantMessage.trim();
      }
      
      console.log('Empty or invalid response, retrying...');
      attempts++;
      
    } catch (error) {
      console.error(`Attempt ${attempts + 1} failed:`, error.message);
      attempts++;
      
      if (attempts >= maxAttempts) {
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
    }
  }

  throw new Error(`Failed to get response from ${model.name} after ${maxAttempts} attempts`);
}

// Multi-model fallback system
async function callWithHFFallback(
  message: string,
  context: any,
  messageHistory: any[]
): Promise<{ response: string; model: string }> {
  
  const primaryModel = selectBestHFModel(message, context);
  
  // Try models in order of capability and reliability
  const models = [
    primaryModel,
    HF_SERVERLESS_MODELS.zephyr,
    HF_SERVERLESS_MODELS.mistral,
    HF_SERVERLESS_MODELS.openchat,
    HF_SERVERLESS_MODELS.codellama,
    HF_SERVERLESS_MODELS.llama2
  ].filter((model, index, self) => 
    index === self.findIndex(m => m.modelId === model.modelId)
  );
  
  for (const model of models) {
    try {
      const response = await callHuggingFaceServerless(message, context, messageHistory, model);
      return { response, model: model.name };
    } catch (error) {
      console.warn(`${model.name} failed:`, error.message);
      continue;
    }
  }
  
  // If all models fail, provide intelligent fallback
  return {
    response: generateIntelligentFallback(message, context),
    model: 'Intelligent Fallback'
  };
}

// Generate intelligent fallback response
function generateIntelligentFallback(message: string, context: any): string {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('portfolio') || messageLower.includes('analyze')) {
    return `I'd be happy to analyze your portfolio! I'm currently experiencing some technical difficulties with the AI models, but I can still provide guidance.

📊 **Portfolio Analysis Framework:**

**Current Status:** You have ${context.connectedSources?.length || 0} data sources connected to Mappr.

**Key Analysis Areas:**
• **Asset Allocation**: Review your mix of stocks, bonds, and alternatives
• **Diversification**: Ensure spread across sectors, geographies, and market caps  
• **Risk Metrics**: Calculate Sharpe ratio, beta, and standard deviation
• **Performance**: Compare returns against relevant benchmarks
• **Rebalancing**: Identify drift from target allocations

**Recommended Asset Allocation by Age:**
• 20s-30s: 80-90% stocks, 10-20% bonds
• 40s: 70-80% stocks, 20-30% bonds  
• 50s: 60-70% stocks, 30-40% bonds
• 60s+: 50-60% stocks, 40-50% bonds

**Next Steps:**
1. Connect more data sources for comprehensive analysis
2. Set target allocation percentages
3. Review quarterly and rebalance as needed
4. Consider tax implications of any changes

Would you like me to explain any of these concepts in more detail?`;
  }
  
  if (messageLower.includes('invest') || messageLower.includes('strategy')) {
    return `I'm here to help with investment strategy! While the AI models are temporarily unavailable, I can share proven investment principles:

💰 **Core Investment Strategy:**

**Investment Priority Order:**
1. Emergency fund (3-6 months expenses)
2. Employer 401(k) match (free money!)
3. High-yield savings for short-term goals
4. Max out IRA ($7,000/year, $8,000 if 50+)
5. Additional 401(k) contributions
6. Taxable investment accounts

**Proven Strategies:**
• **Dollar-Cost Averaging**: Invest fixed amounts regularly
• **Index Fund Focus**: Low fees, broad diversification
• **Tax Efficiency**: Use tax-advantaged accounts first
• **Long-Term Thinking**: Time in market beats timing the market

**Asset Allocation Guidelines:**
• **Aggressive (20s-30s)**: 90% stocks, 10% bonds
• **Moderate (40s-50s)**: 70% stocks, 30% bonds
• **Conservative (60s+)**: 50% stocks, 50% bonds

**Risk Management:**
• Diversify across asset classes and geographies
• Keep some international exposure (20-30%)
• Consider small allocation to alternatives (REITs, commodities)
• Regular rebalancing (quarterly or annually)

**To create your personalized strategy:**
Connect your accounts to Mappr so I can analyze your current situation and provide specific recommendations.

What's your investment timeline and primary goals?`;
  }
  
  return `I'm currently experiencing some technical difficulties with the AI models, but I'm still here to help with your financial questions!

🤖 **Available Guidance:**
• Investment strategies and portfolio allocation
• Risk management and diversification principles  
• Retirement planning and goal-based investing
• Tax-efficient investing approaches
• Crypto and alternative investment basics

💡 **While the AI is restored:**
1. Connect your financial accounts to Mappr for data-driven insights
2. Ask specific questions about financial concepts
3. Include context like your age, goals, and risk tolerance

🔧 **Common Financial Topics:**
• "How should I allocate my 401(k)?"
• "What's a good emergency fund amount?"
• "Should I pay off debt or invest?"
• "How do I start investing with little money?"

The AI services should be back online shortly. What specific financial topic would you like to explore?`;
}

// ===========================================
// MAIN API ROUTE HANDLER
// ===========================================
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversationId, context } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check for Hugging Face token
    if (!process.env.HF_TOKEN) {
      return NextResponse.json({
        error: 'Configuration error',
        message: 'Hugging Face token not configured. Please add HF_TOKEN to your environment variables.'
      }, { status: 500 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, tier')
      .eq('user_id', session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Rate limiting for free models
    const rateLimits = { free: 300, pro: 1000, enterprise: -1 };
    
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

    // Build user context
    const aiContext = await buildUserContext(supabase, profile.id);

    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: message,
      timestamp: new Date().toISOString()
    };

    const currentMessages = Array.isArray(conversation.messages) ? conversation.messages : [];
    const updatedMessages = [...currentMessages, userMessage];

    // Get AI response
    const startTime = Date.now();
    console.log(`Processing: "${message.slice(0, 100)}..."`);
    
    const { response: aiResponse, model: usedModel } = await callWithHFFallback(
      message,
      aiContext,
      updatedMessages
    );
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ Response from ${usedModel} in ${processingTime}ms`);

    const assistantMessage = {
      id: crypto.randomUUID(),
      role: 'assistant' as const,
      content: aiResponse,
      timestamp: new Date().toISOString(),
      metadata: {
     
        model: usedModel,
        type: 'financial_analysis',
        confidence: usedModel.includes('Fallback') ? 0.7 : 0.9,
        processingTime: Date.now() - startTime,
        wordCount: aiResponse.split(/\s+/).length,
      
      }
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
    
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Unable to process your request. Please try again later.'
    }, { status: 500 });
  }
}

// Build user context
async function buildUserContext(supabase: any, userId: string) {
  try {
    const { data: userExtensions } = await supabase
      .from('user_extensions')
      .select(`
        id,
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

    const { data: recentData } = await supabase
      .from('aggregated_data')
      .select('data_type, created_at, metadata')
      .in('user_extension_id', userExtensions?.map(ue => ue.id) || [])
      .order('created_at', { ascending: false })
      .limit(20);

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
        itemTypes: [...new Set(p.portfolio_items?.map(item => item.item_type) || [])]
      })) || [],
      dataActivity: {
        totalRecords: recentData?.length || 0,
        dataTypes: dataTypeCounts,
        lastUpdate: recentData?.[0]?.created_at || null
      }
    };
  } catch (error) {
    console.error('Error building context:', error);
    return { 
      connectedSources: [],
      portfolios: [],
      dataActivity: { totalRecords: 0, dataTypes: {}, lastUpdate: null }
    };
  }
}