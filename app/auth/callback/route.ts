import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/dashboard';

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(
          new URL(`/auth/signin?error=${encodeURIComponent(error.message)}`, request.url)
        );
      }

      // Check if this is a new user (first time signing in)
      if (data.user && !data.user.email_confirmed_at) {
        return NextResponse.redirect(
          new URL(`/auth/verify-email?email=${encodeURIComponent(data.user.email || '')}`, request.url)
        );
      }

      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('user_id', data.user?.id)
        .single();

      if (profile && !profile.onboarding_completed) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }

      // Redirect to the intended destination
      return NextResponse.redirect(new URL(redirect, request.url));
    } catch (error) {
      console.error('Unexpected auth callback error:', error);
      return NextResponse.redirect(
        new URL('/auth/signin?error=Authentication failed', request.url)
      );
    }
  }

  // If no code, redirect to sign in
  return NextResponse.redirect(new URL('/auth/signin', request.url));
}