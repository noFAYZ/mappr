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

    const { messageId, feedback } = await request.json();

    // Store feedback for analytics (you might want to create a feedback table)
    console.log("AI Feedback received:", {
      messageId,
      feedback,
      userId: session.user.id,
    });

    return NextResponse.json({ message: "Feedback received" });
  } catch (error) {
    console.error("Error storing feedback:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
