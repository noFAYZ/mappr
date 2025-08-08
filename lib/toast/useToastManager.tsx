// lib/toast/useToastManager.ts
import { RefreshCw, Zap } from "lucide-react";

import { ToastManager } from "./toastManager";

import { useModernToast, Toast } from "@/components/ui/Toaster";
import { useUIStore } from "@/stores/ui";

// Hook for the enhanced toast manager
export const useToastManager = () => {
  const { addToast, dismissToast, dismissAll, updateToast } = useModernToast();
  const { addNotification } = useUIStore();

  const manager = new ToastManager(addToast, addNotification);

  return {
    ...manager,
    dismissToast,
    dismissAll,
    updateToast,

    // Batch operations
    showMultiple: (toasts: Array<Omit<Toast, "id" | "createdAt">>) => {
      return toasts.map((toast) => addToast(toast));
    },

    // Progress toast that can be updated
    showProgress: (title: string, initialProgress: number = 0) => {
      const id = addToast({
        variant: "loading",
        title,
        persistent: true,
        progress: {
          current: initialProgress,
          total: 100,
          label: "Progress",
        },
      });

      return {
        id,
        update: (progress: number, description?: string) => {
          updateToast(id, {
            description,
            progress: {
              current: progress,
              total: 100,
              label: "Progress",
            },
          });
        },
        complete: (successTitle: string, successDescription?: string) => {
          dismissToast(id);

          return addToast({
            variant: "success",
            title: successTitle,
            description: successDescription,
          });
        },
        fail: (errorTitle: string, errorDescription?: string) => {
          dismissToast(id);

          return addToast({
            variant: "error",
            title: errorTitle,
            description: errorDescription,
          });
        },
      };
    },

    // Conditional toasts (only show if condition is met)
    showIf: (condition: boolean, toast: Omit<Toast, "id" | "createdAt">) => {
      return condition ? addToast(toast) : null;
    },

    // Delayed toast
    showDelayed: (delay: number, toast: Omit<Toast, "id" | "createdAt">) => {
      return setTimeout(() => addToast(toast), delay);
    },

    // Toast with auto-retry functionality
    showWithRetry: (
      toast: Omit<Toast, "id" | "createdAt">,
      retryFn: () => Promise<boolean>,
      maxRetries: number = 3,
    ) => {
      let retryCount = 0;

      const attemptAction = async () => {
        try {
          const success = await retryFn();

          if (success) {
            manager.success(
              "Action Completed",
              "Operation completed successfully",
            );
          } else {
            throw new Error("Action failed");
          }
        } catch (error) {
          retryCount++;
          if (retryCount < maxRetries) {
            manager.warning(
              "Action Failed",
              `Attempt ${retryCount}/${maxRetries} failed. Retrying...`,
              [
                {
                  label: "Retry Now",
                  handler: attemptAction,
                  variant: "primary",
                  icon: <RefreshCw className="w-3 h-3" />,
                },
              ],
            );
          } else {
            manager.error("Action Failed", "Maximum retry attempts reached");
          }
        }
      };

      return addToast({
        ...toast,
        actions: [
          ...(toast.actions || []),
          {
            label: "Start",
            handler: attemptAction,
            variant: "primary",
            icon: <Zap className="w-3 h-3" />,
          },
        ],
      });
    },
  };
};

export default useToastManager;
