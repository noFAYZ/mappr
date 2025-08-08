import type { Database } from "@/types/supabase";

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { EncryptionService } from "@/lib/encryption";

export async function POST(request: NextRequest) {
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

    const { extensionId, connectionName, credentials } = await request.json();

    if (!extensionId || !connectionName || !credentials) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, tier")
      .eq("user_id", session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get extension details
    const { data: extension } = await supabase
      .from("extensions")
      .select("*")
      .eq("id", extensionId)
      .single();

    if (!extension) {
      return NextResponse.json(
        { error: "Extension not found" },
        { status: 404 },
      );
    }

    // Check tier restrictions
    const tierRestrictions = extension.tier_restrictions as Record<
      string,
      boolean
    >;

    if (tierRestrictions[profile.tier] !== true) {
      return NextResponse.json(
        { error: "Upgrade required for this extension" },
        { status: 403 },
      );
    }

    // Encrypt credentials
    const encryptedCredentials = EncryptionService.encrypt(
      JSON.stringify(credentials),
    );

    // Create user extension connection
    const { data: userExtension, error } = await supabase
      .from("user_extensions")
      .insert({
        user_id: profile.id,
        extension_id: extensionId,
        connection_name: connectionName,
        credentials: encryptedCredentials,
        configuration: {},
        is_enabled: true,
        sync_status: "pending",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // TODO: Trigger initial sync job here
    // await triggerSync(userExtension.id);

    return NextResponse.json({ data: userExtension });
  } catch (error) {
    console.error("Error connecting extension:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
