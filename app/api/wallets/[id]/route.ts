import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { ErrorHandler } from "@/lib/utils/error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Get wallet with user verification
    const { data: wallet, error } = await supabase
      .from("wallet_analytics")
      .select("*")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (error || !wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    return NextResponse.json({ data: wallet });
  } catch (error: any) {
    ErrorHandler.handle(error, `GET /api/wallets/${params.id}`);

    return NextResponse.json(
      { error: ErrorHandler.createUserFriendlyMessage(error) },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const updates = await request.json();

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Validate wallet ownership
    const { data: existingWallet } = await supabase
      .from("user_wallets")
      .select("id")
      .eq("id", id)
      .eq("user_id", profile.id)
      .single();

    if (!existingWallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    // Update wallet
    const { data: wallet, error } = await supabase
      .from("user_wallets")
      .update({
        name: updates.name,
        metadata: {
          ...updates.metadata,
          updatedAt: new Date().toISOString(),
        },
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data: wallet });
  } catch (error: any) {
    ErrorHandler.handle(error, `PATCH /api/wallets/${params.id}`);

    return NextResponse.json(
      { error: ErrorHandler.createUserFriendlyMessage(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Soft delete wallet
    const { error } = await supabase
      .from("user_wallets")
      .update({
        is_active: false,
        metadata: {
          deletedAt: new Date().toISOString(),
          deletedBy: session.user.id,
        },
      })
      .eq("id", id)
      .eq("user_id", profile.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    ErrorHandler.handle(error, `DELETE /api/wallets/${params.id}`);

    return NextResponse.json(
      { error: ErrorHandler.createUserFriendlyMessage(error) },
      { status: 500 },
    );
  }
}
