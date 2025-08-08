import { toast as sonnerToast } from "sonner";
import {
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";

// Enhanced toast utility with consistent styling
export const toast = {
  // Success toast
  success: (
    message: string,
    options?: {
      description?: string;
      action?: {
        label: string;
        onClick: () => void;
      };
      duration?: number;
    },
  ) => {
    return sonnerToast.success(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      icon: CheckCircle,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  // Error toast
  error: (
    message: string,
    options?: {
      description?: string;
      action?: {
        label: string;
        onClick: () => void;
      };
      duration?: number;
    },
  ) => {
    return sonnerToast.error(message, {
      description: options?.description,
      duration: options?.duration || 8000,
      icon: AlertCircle,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  // Warning toast
  warning: (
    message: string,
    options?: {
      description?: string;
      action?: {
        label: string;
        onClick: () => void;
      };
      duration?: number;
    },
  ) => {
    return sonnerToast.warning(message, {
      description: options?.description,
      duration: options?.duration || 6000,
      icon: AlertTriangle,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  // Info toast
  info: (
    message: string,
    options?: {
      description?: string;
      action?: {
        label: string;
        onClick: () => void;
      };
      duration?: number;
    },
  ) => {
    return sonnerToast.info(message, {
      description: options?.description,
      duration: options?.duration || 5000,
      icon: Info,
      action: options?.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
  },

  // Loading toast
  loading: (
    message: string,
    options?: {
      description?: string;
    },
  ) => {
    return sonnerToast.loading(message, {
      description: options?.description,
      icon: Loader2,
    });
  },

  // Promise toast for async operations
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },

  // Dismiss all toasts
  dismiss: (toastId?: string | number) => {
    return sonnerToast.dismiss(toastId);
  },
};

// Specialized toast functions for common use cases
export const walletToast = {
  // Wallet connection success
  connected: (walletName: string, address: string) => {
    toast.success("Wallet Connected", {
      description: `${walletName} connected successfully`,
      action: {
        label: "Copy Address",
        onClick: () => {
          navigator.clipboard.writeText(address);
          toast.success("Address copied to clipboard");
        },
      },
    });
  },

  // Wallet sync success
  synced: (walletName: string, tokenCount: number) => {
    toast.success("Wallet Synced", {
      description: `Updated ${walletName} with ${tokenCount} tokens`,
    });
  },

  // Transaction success
  transactionSuccess: (txHash: string, amount: string, token: string) => {
    toast.success("Transaction Successful", {
      description: `Sent ${amount} ${token}`,
      action: {
        label: "View on Explorer",
        onClick: () => {
          // Open transaction in block explorer
          window.open(`https://etherscan.io/tx/${txHash}`, "_blank");
        },
      },
    });
  },

  // Connection error
  connectionError: (error: string) => {
    toast.error("Connection Failed", {
      description: error,
      action: {
        label: "Retry",
        onClick: () => {
          // Retry connection logic
          window.location.reload();
        },
      },
    });
  },
};

export const dataToast = {
  // Data sync success
  syncSuccess: (source: string, recordCount: number) => {
    toast.success("Data Synchronized", {
      description: `${recordCount} records updated from ${source}`,
    });
  },

  // Export success
  exportSuccess: (format: string, filename: string) => {
    toast.success("Export Complete", {
      description: `Data exported as ${format}`,
      action: {
        label: "Download",
        onClick: () => {
          // Trigger download
          const link = document.createElement("a");

          link.href = `/downloads/${filename}`;
          link.download = filename;
          link.click();
        },
      },
    });
  },

  // Import success
  importSuccess: (recordCount: number) => {
    toast.success("Import Complete", {
      description: `Successfully imported ${recordCount} records`,
    });
  },

  // Validation error
  validationError: (errors: string[]) => {
    toast.error("Validation Failed", {
      description: `${errors.length} error(s) found in your data`,
      action: {
        label: "View Details",
        onClick: () => {
          // Show validation errors modal
          console.log("Show validation errors:", errors);
        },
      },
    });
  },
};

export const systemToast = {
  // Feature announcement
  newFeature: (featureName: string, description: string) => {
    toast.info("New Feature Available", {
      description: `${featureName}: ${description}`,
      action: {
        label: "Learn More",
        onClick: () => {
          // Navigate to feature documentation
          window.open("/docs/features", "_blank");
        },
      },
    });
  },

  // Maintenance notice
  maintenance: (startTime: string, duration: string) => {
    toast.warning("Scheduled Maintenance", {
      description: `System maintenance from ${startTime} (${duration})`,
      duration: 10000,
    });
  },

  // Subscription limit
  limitReached: (limitType: string) => {
    toast.warning("Usage Limit Reached", {
      description: `You've reached your ${limitType} limit`,
      action: {
        label: "Upgrade Plan",
        onClick: () => {
          // Navigate to billing page
          window.location.href = "/billing";
        },
      },
    });
  },
};
