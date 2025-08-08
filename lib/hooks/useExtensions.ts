import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useExtensionStore } from "@/stores";

export function useExtensions() {
  const queryClient = useQueryClient();
  const { setExtensions, setLoading, setError } = useExtensionStore();

  const extensionsQuery = useQuery({
    queryKey: ["extensions"],
    queryFn: async () => {
      const response = await fetch("/api/extensions");

      if (!response.ok) {
        throw new Error("Failed to fetch extensions");
      }
      const result = await response.json();

      return result.data;
    },
    onSuccess: (data) => {
      setExtensions(data);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const connectMutation = useMutation({
    mutationFn: async ({
      extensionId,
      credentials,
    }: {
      extensionId: string;
      credentials: any;
    }) => {
      const response = await fetch("/api/extensions/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extensionId, credentials }),
      });

      if (!response.ok) {
        const error = await response.json();

        throw new Error(error.message || "Failed to connect extension");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extensions"] });
      queryClient.invalidateQueries({ queryKey: ["user-extensions"] });
    },
  });

  return {
    extensions: extensionsQuery.data || [],
    isLoading: extensionsQuery.isLoading,
    error: extensionsQuery.error?.message,
    connectExtension: connectMutation.mutate,
    isConnecting: connectMutation.isLoading,
    connectError: connectMutation.error?.message,
  };
}
