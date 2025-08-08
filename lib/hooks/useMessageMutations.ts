import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Message } from "@/app/ai/components/types";

interface SendMessageData {
  conversationId: string;
  message: string;
  attachments?: File[];
}

interface SendMessageResponse {
  message: Message;
  conversationId: string;
}

export const useEnhancedMessageMutations = () => {
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async ({
      conversationId,
      message,
      attachments,
    }: SendMessageData): Promise<SendMessageResponse> => {
      const formData = new FormData();

      formData.append("message", message);
      formData.append("conversationId", conversationId);

      if (attachments?.length) {
        attachments.forEach((file, index) => {
          formData.append(`attachment_${index}`, file);
        });
      }

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response
          .json()
          .catch(() => ({ message: "Network error" }));

        throw new Error(
          error.message || `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Update the conversation cache with the new message
      queryClient.setQueryData(
        ["conversation", data.conversationId],
        (old: any) => {
          if (!old) return old;

          return {
            ...old,
            messages: [...(old.messages || []), data.message],
          };
        },
      );

      // Invalidate conversations list to update last message
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => {
      console.error("Send message failed:", error);
      toast.error(error.message || "Failed to send message");
    },
  });

  const regenerateMessageMutation = useMutation({
    mutationFn: async ({
      messageId,
      conversationId,
    }: {
      messageId: string;
      conversationId: string;
    }) => {
      const response = await fetch("/api/ai/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, conversationId }),
      });

      if (!response.ok) {
        throw new Error("Failed to regenerate message");
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversation", variables.conversationId],
      });
      toast.success("Message regenerated");
    },
    onError: (error) => {
      console.error("Regenerate failed:", error);
      toast.error("Failed to regenerate message");
    },
  });

  return {
    sendMessageMutation,
    regenerateMessageMutation,
  };
};
