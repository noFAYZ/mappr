import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';


export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
      
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError || !session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .single();
  
      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
  
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', params.id)
        .eq('user_id', profile.id);
  
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
  
      return NextResponse.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }
  