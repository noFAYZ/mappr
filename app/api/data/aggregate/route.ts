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

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dataType = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", session.user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Get user's extensions
    const { data: userExtensions } = await supabase
      .from("user_extensions")
      .select("id")
      .eq("user_id", profile.id)
      .eq("is_enabled", true);

    if (!userExtensions?.length) {
      return NextResponse.json({ data: [], total: 0 });
    }

    let query = supabase
      .from("aggregated_data")
      .select("*", { count: "exact" })
      .in(
        "user_extension_id",
        userExtensions.map((ue) => ue.id),
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (dataType) {
      query = query.eq("data_type", dataType);
    }

    const { data: aggregatedData, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      data: aggregatedData,
      total: count,
      offset,
      limit,
    });
  } catch (error) {
    console.error("Error fetching aggregated data:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
