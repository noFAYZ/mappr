import React, { useState } from 'react';
import { X, AlertTriangle, RefreshCw, Wallet } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/modal';
import { Input, Button } from '@heroui/react';
import { toast } from 'sonner';

interface AddWalletModalProps {
  onClose: () => void;
  onAdd: (address: string, name?: string) => Promise<void>;
}

const AddWalletModal = ({ isOpen, onOpenChange, onAdd }) => {
  const [address, setAddress] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!address.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
      setError('Please enter a valid Ethereum address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onAdd(address.trim(), name.trim() || undefined);
      setAddress('');
      setName('');
      setError('');
      onOpenChange(false);
      toast.success('Wallet added successfully');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                Add New Wallet
              </div>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Input
                  label="Wallet Address"
                  placeholder="0x742d35Cc6634C0532925a3b8D7C9b6f67C7e3Dd9"
                  value={address}
                  onValueChange={setAddress}
                  isRequired
                  startContent={<Wallet className="h-4 w-4 text-default-400" />}
                  description="Enter a valid Ethereum wallet address (0x...)"
                  classNames={{
                    input: "font-mono",
                  }}
                  isDisabled={loading}
                />
                
                <Input
                  label="Wallet Name (Optional)"
                  placeholder="My Main Wallet"
                  value={name}
                  onValueChange={setName}
                  description="Give your wallet a memorable name for easy identification"
                  isDisabled={loading}
                />

                {error && (
                  <div className="flex items-start gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-danger mt-0.5 shrink-0" />
                    <div>
                      <p className="text-small font-medium text-danger">Error</p>
                      <p className="text-small text-danger/80">{error}</p>
                    </div>
                  </div>
                )}

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <h4 className="text-small font-medium text-primary mb-2">
                    Supported Networks
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-small text-primary/80">
                    <div>• Ethereum Mainnet</div>
                    <div>• Polygon</div>
                    <div>• Arbitrum</div>
                    <div>• Optimism</div>
                    <div>• Base</div>
                    <div>• BSC</div>
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                variant="flat" 
                onPress={onClose}
                isDisabled={loading}
              >
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleAdd}
                isLoading={loading}
                isDisabled={!address.trim()}
              >
                Add Wallet
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AddWalletModal;