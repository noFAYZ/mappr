'use client'
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { CheckboxGroup, Checkbox } from "@heroui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wallet,
  AlertCircle,
  CheckCircle2,
  Copy,
  Scan,
  Zap,
  Shield,
  Clock,
  Network,
  Plus,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  Smartphone,
  Monitor,
  Globe,
  Edit3
} from "lucide-react";

// ==================== TYPES ====================
interface AddWalletModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddWallet: (address: string, name?: string, chainType?: string) => Promise<boolean>;
  isLoading?: boolean;
}

interface FormData {
  address: string;
  name: string;
  networks: string[];
  chainType: string;
}

interface ValidationState {
  isValid: boolean;
  errors: {
    address?: string;
    name?: string;
    networks?: string;
  };
}

interface ProgressState {
  phase: "idle" | "validating" | "connecting" | "syncing" | "complete" | "error";
  progress: number;
  message: string;
  details?: string;
}




// ==================== CONSTANTS ====================
const SUPPORTED_NETWORKS = [
  { id: "ethereum", name: "Ethereum", color: "from-blue-500 to-purple-600", chainType: "evm" },
  { id: "polygon", name: "Polygon", color: "from-purple-500 to-pink-600", chainType: "evm" },
  { id: "arbitrum", name: "Arbitrum", color: "from-blue-400 to-cyan-600", chainType: "evm" },
  { id: "optimism", name: "Optimism", color: "from-red-500 to-pink-600", chainType: "evm" },
  { id: "base", name: "Base", color: "from-blue-600 to-indigo-600", chainType: "evm" },
  { id: "bsc", name: "BSC", color: "from-yellow-500 to-orange-600", chainType: "evm" },
  { id: "avalanche", name: "Avalanche", color: "from-red-600 to-pink-600", chainType: "evm" },
  { id: "fantom", name: "Fantom", color: "from-blue-500 to-teal-600", chainType: "evm" }
];

const WALLET_SOURCES = [
  { id: "manual", name: "Manual Entry", icon: Wallet, description: "Enter wallet address manually" },
  { id: "qr", name: "QR Code", icon: Scan, description: "Scan QR code from mobile wallet" },
  { id: "connect", name: "Connect Wallet", icon: Zap, description: "Connect directly from browser wallet" }
];

const INITIAL_FORM_DATA: FormData = {
  address: "",
  name: "",
  networks: ["ethereum"],
  chainType: "evm"
};

// ==================== UTILITY FUNCTIONS ====================
const validateWalletAddress = (address: string): boolean => {
  // EVM address validation
  const evmRegex = /^0x[a-fA-F0-9]{40}$/;
  return evmRegex.test(address);
};

const getChainTypeFromNetwork = (network: string): string => {
  const networkConfig = SUPPORTED_NETWORKS.find(n => n.id === network);
  return networkConfig?.chainType || "evm";
};

const formatAddressPreview = (address: string): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// ==================== COMPONENTS ====================

// Network Selection Component
const NetworkSelector: React.FC<{
  selectedNetworks: string[];
  onNetworksChange: (networks: string[]) => void;
  disabled?: boolean;
}> = ({ selectedNetworks, onNetworksChange, disabled = false }) => {
  const handleNetworkToggle = useCallback((networkId: string) => {
    if (disabled) return;
    
    const isSelected = selectedNetworks.includes(networkId);
    if (isSelected && selectedNetworks.length === 1) {
      // Don't allow deselecting the last network
      return;
    }
    
    const newNetworks = isSelected
      ? selectedNetworks.filter(id => id !== networkId)
      : [...selectedNetworks, networkId];
      
    onNetworksChange(newNetworks);
  }, [selectedNetworks, onNetworksChange, disabled]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Supported Networks
        </label>
        <span className="text-xs text-default-500">
          {selectedNetworks.length} selected
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        {SUPPORTED_NETWORKS.map((network) => {
          const isSelected = selectedNetworks.includes(network.id);
          return (
            <Card
              key={network.id}
              className={`cursor-pointer transition-all duration-200 ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              } ${
                isSelected
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-950"
                  : "border-divider hover:border-primary-300"
              }`}
              isPressable={!disabled}
              onPress={() => handleNetworkToggle(network.id)}
            >
              <CardBody className="p-3">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${network.color}`} />
                  <span className="text-sm font-medium">{network.name}</span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-primary-500 ml-auto" />
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Progress Indicator Component
const ProgressIndicator: React.FC<{ state: ProgressState }> = ({ state }) => {
  const getProgressColor = () => {
    switch (state.phase) {
      case "error": return "danger";
      case "complete": return "success";
      default: return "primary";
    }
  };

  const getIcon = () => {
    switch (state.phase) {
      case "validating": return Shield;
      case "connecting": return Network;
      case "syncing": return RefreshCw;
      case "complete": return CheckCircle2;
      case "error": return AlertCircle;
      default: return Clock;
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full bg-${getProgressColor()}-100 dark:bg-${getProgressColor()}-900 flex items-center justify-center`}>
          <Icon className={`w-4 h-4 text-${getProgressColor()}-600 ${state.phase === "syncing" ? "animate-spin" : ""}`} />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground">{state.message}</p>
          {state.details && (
            <p className="text-sm text-default-500">{state.details}</p>
          )}
        </div>
      </div>
      
      <Progress
        value={state.progress}
        color={getProgressColor()}
        className="w-full"
        size="sm"
      />
    </motion.div>
  );
};

// Address Input Component
const AddressInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}> = ({ value, onChange, error, disabled = false }) => {
  const [isValidating, setIsValidating] = useState(false);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text.trim());
    } catch (error) {
      console.error("Failed to read clipboard:", error);
    }
  }, [onChange]);

  const isValid = useMemo(() => {
    return value.length === 0 || validateWalletAddress(value);
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Wallet Address
        </label>
        <Button
          size="sm"
          variant="flat"
          startContent={<Copy className="w-3 h-3" />}
          onPress={handlePaste}
          disabled={disabled}
          className="h-6 px-2 text-xs"
        >
          Paste
        </Button>
      </div>
      
      <Input
        placeholder="0x..."
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        isInvalid={!!error || (value.length > 0 && !isValid)}
        errorMessage={error || (value.length > 0 && !isValid ? "Invalid wallet address format" : "")}
        startContent={<Wallet className="w-4 h-4 text-default-400" />}
        endContent={
          value.length > 0 && isValid ? (
            <CheckCircle2 className="w-4 h-4 text-success-500" />
          ) : null
        }
      />
      
      {value.length > 0 && isValid && (
        <p className="text-xs text-success-600">
          Valid address format: {formatAddressPreview(value)}
        </p>
      )}
    </div>
  );
};

// Main Modal Component
const AddWalletModal: React.FC<AddWalletModalProps> = ({
  isOpen,
  onOpenChange,
  onAddWallet,
  isLoading = false
}) => {
  // State
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [validation, setValidation] = useState<ValidationState>({
    isValid: false,
    errors: {}
  });
  const [progressState, setProgressState] = useState<ProgressState>({
    phase: "idle",
    progress: 0,
    message: "",
    details: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Validation logic
  const validateForm = useCallback((): ValidationState => {
    const errors: ValidationState["errors"] = {};
    
    if (!formData.address.trim()) {
      errors.address = "Wallet address is required";
    } else if (!validateWalletAddress(formData.address)) {
      errors.address = "Invalid wallet address format";
    }
    
    if (formData.networks.length === 0) {
      errors.networks = "At least one network must be selected";
    }

    const isValid = Object.keys(errors).length === 0;
    
    return { isValid, errors };
  }, [formData]);

  // Update validation when form changes
  useEffect(() => {
    const newValidation = validateForm();
    setValidation(newValidation);
  }, [validateForm]);

  // Form handlers
  const handleFormChange = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateProgress = useCallback((state: Partial<ProgressState>) => {
    setProgressState(prev => ({ ...prev, ...state }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validation.isValid || isProcessing) return;

    try {
      setIsProcessing(true);
      
      // Phase 1: Validation
      updateProgress({
        phase: "validating",
        message: "Validating wallet address",
        details: "Checking address format and network compatibility",
        progress: 20,
      });
      await new Promise(resolve => setTimeout(resolve, 800));

      // Phase 2: Connecting
      updateProgress({
        phase: "connecting",
        message: "Connecting to blockchain",
        details: `Establishing connection to ${formData.networks.length} network(s)`,
        progress: 50,
      });
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Phase 3: Syncing
      updateProgress({
        phase: "syncing",
        message: "Syncing wallet data",
        details: "Fetching balances and transaction history",
        progress: 80,
      });

      // Determine chain type
      const chainType = getChainTypeFromNetwork(formData.networks[0]);

      // Add wallet
      const success = await onAddWallet(
        formData.address.trim(),
        formData.name.trim() || undefined,
        chainType
      );

      if (success) {
        updateProgress({
          phase: "complete",
          message: "Wallet added successfully!",
          details: "Your wallet is now ready to track",
          progress: 100,
        });

        setTimeout(() => {
          onOpenChange(false);
          handleReset();
        }, 2000);
      } else {
        throw new Error("Failed to add wallet");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      
      updateProgress({
        phase: "error",
        message: "Failed to add wallet",
        details: errorMessage,
        progress: 0,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [validation.isValid, isProcessing, formData, onAddWallet, onOpenChange, updateProgress]);

  const handleReset = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setProgressState({
      phase: "idle",
      progress: 0,
      message: "",
      details: ""
    });
    setIsProcessing(false);
  }, []);

  const handleClose = useCallback(() => {
    if (!isProcessing) {
      onOpenChange(false);
      setTimeout(handleReset, 300); // Reset after modal animation
    }
  }, [isProcessing, onOpenChange, handleReset]);

  const canSubmit = validation.isValid && !isProcessing;
  const showProgress = progressState.phase !== "idle";

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      scrollBehavior="inside"
      closeButton={!isProcessing}
      isDismissable={!isProcessing}
      hideCloseButton={isProcessing}
      classNames={{
        base: "bg-content1",
        header: "border-b border-divider",
        footer: "border-t border-divider"
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Plus className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Add New Wallet</h3>
              <p className="text-sm text-default-500 font-normal">
                Connect your cryptocurrency wallet to start tracking your portfolio
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="py-6">
          <AnimatePresence mode="wait">
            {showProgress ? (
              <motion.div
                key="progress"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ProgressIndicator state={progressState} />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Wallet Address Input */}
                <AddressInput
                  value={formData.address}
                  onChange={(value) => handleFormChange("address", value)}
                  error={validation.errors.address}
                  disabled={isProcessing}
                />

                {/* Wallet Name Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Wallet Name (Optional)
                  </label>
                  <Input
                    placeholder="My Main Wallet"
                    value={formData.name}
                    onValueChange={(value) => handleFormChange("name", value)}
                    disabled={isProcessing}
                    startContent={<Edit3 className="w-4 h-4 text-default-400" />}
                  />
                  <p className="text-xs text-default-500">
                    Give your wallet a memorable name for easy identification
                  </p>
                </div>

                {/* Network Selection */}
                <NetworkSelector
                  selectedNetworks={formData.networks}
                  onNetworksChange={(networks) => handleFormChange("networks", networks)}
                  disabled={isProcessing}
                />

                {/* Security Notice */}
                <Card className="border-success-200 bg-success-50 dark:bg-success-950">
                  <CardBody className="p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-medium text-success-800 dark:text-success-200">
                          Read-Only Access
                        </h4>
                        <p className="text-sm text-success-700 dark:text-success-300">
                          We only read your wallet's public data. Your private keys remain secure and we cannot perform transactions.
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </ModalBody>

        <ModalFooter>
          <div className="flex items-center justify-between w-full">
            <Button
              variant="flat"
              onPress={handleClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            
            <div className="flex items-center gap-3">
              {progressState.phase === "error" && (
                <Button
                  variant="flat"
                  color="warning"
                  startContent={<RefreshCw className="w-4 h-4" />}
                  onPress={() => {
                    setProgressState({ phase: "idle", progress: 0, message: "" });
                    setIsProcessing(false);
                  }}
                >
                  Try Again
                </Button>
              )}
              
              <Button
                color="primary"
                onPress={handleSubmit}
                disabled={!canSubmit || progressState.phase === "complete"}
                isLoading={isProcessing}
                startContent={
                  !isProcessing && progressState.phase !== "complete" ? (
                    <Plus className="w-4 h-4" />
                  ) : progressState.phase === "complete" ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : null
                }
              >
                {progressState.phase === "complete" 
                  ? "Added Successfully" 
                  : isProcessing 
                    ? "Adding Wallet..." 
                    : "Add Wallet"
                }
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddWalletModal;