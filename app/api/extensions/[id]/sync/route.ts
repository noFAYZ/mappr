import type { Database } from "@/types/supabase";

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookieStore,
    });

    // Get current user
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Update sync status to 'syncing'
    const { error: updateError } = await supabase
      .from("user_extensions")
      .update({
        sync_status: "syncing",
        sync_error: null,
        last_sync_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .eq("user_id", profile.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // TODO: Trigger background sync job here
    // await triggerSyncJob(params.id);

    return NextResponse.json({ message: "Sync started successfully" });
  } catch (error) {
    console.error("Error starting sync:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
