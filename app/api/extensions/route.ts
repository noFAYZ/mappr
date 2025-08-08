import type { Database } from "@/types/supabase";

import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
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

    // Get user profile to check tier
    const { data: profile } = await supabase
      .from("profiles")
      .select("tier")
      .eq("user_id", session.user.id)
      .single();

    // Get all active extensions
    const { data: extensions, error } = await supabase
      .from("extensions")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Filter extensions based on user tier
    const userTier = profile?.tier || "free";
    const filteredExtensions =
      extensions?.filter((ext) => {
        const tierRestrictions = ext.tier_restrictions as Record<
          string,
          boolean
        >;

        return tierRestrictions[userTier] === true;
      }) || [];

    return NextResponse.json({ data: filteredExtensions });
  } catch (error) {
    console.error("Error fetching extensions:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
