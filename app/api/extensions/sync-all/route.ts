import type { Database } from "@/types/supabase";

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({
      cookies: () => cookieStore,
    });

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get all enabled user extensions
    const { data: userExtensions } = await supabase
      .from("user_extensions")
      .select("id, connection_name, extensions(name)")
      .eq("user_id", profile.id)
      .eq("is_enabled", true);

    if (!userExtensions?.length) {
      return NextResponse.json({
        message: "No extensions to sync",
        synced: 0,
      });
    }

    // Update all to syncing status
    const { error: updateError } = await supabase
      .from("user_extensions")
      .update({
        sync_status: "syncing",
        last_sync_at: new Date().toISOString(),
      })
      .eq("user_id", profile.id)
      .eq("is_enabled", true);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // TODO: Trigger background sync jobs for each extension
    // await Promise.all(userExtensions.map(ue => triggerSyncJob(ue.id)));

    return NextResponse.json({
      message: `Sync initiated for ${userExtensions.length} extensions`,
      synced: userExtensions.length,
      extensions: userExtensions.map((ue) => ({
        id: ue.id,
        name: ue.connection_name,
        extensionName: ue.extensions?.name,
      })),
    });
  } catch (error) {
    console.error("Error syncing all extensions:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
