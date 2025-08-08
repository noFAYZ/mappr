import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { Database } from "@/types/supabase";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const cookieStore = await cookies();
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

    const conversationId = params.id;
    const updateData = await request.json();

    const updateFields: any = {
      updated_at: new Date().toISOString(),
    };

    if (updateData.title !== undefined) {
      updateFields.title = updateData.title;
    }

    if (updateData.messages !== undefined) {
      updateFields.messages = updateData.messages;
      updateFields.message_count = updateData.messages.length;

      if (updateData.messages.length > 0) {
        const lastMessage = updateData.messages[updateData.messages.length - 1];

        updateFields.last_message_at =
          lastMessage.timestamp || new Date().toISOString();
      }
    }

    if (updateData.metadata !== undefined) {
      updateFields.metadata = updateData.metadata;
    }

    if (updateData.is_starred !== undefined) {
      updateFields.is_starred = updateData.is_starred;
    }

    const { data: updatedConversation, error: updateError } = await supabase
      .from("ai_conversations")
      .update(updateFields)
      .eq("id", conversationId)
      .eq("user_id", profile.id)
      .select()
      .single();

    if (updateError) {
      console.error("Update conversation error:", updateError);

      return NextResponse.json(
        { error: "Failed to update conversation" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      conversation: updatedConversation,
    });
  } catch (error) {
    console.error("Update conversation API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
