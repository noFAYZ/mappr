"use client";

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Select, SelectItem } from '@heroui/select';
import { Chip } from '@heroui/chip';
import { Badge } from '@heroui/badge';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Tabs, Tab } from '@heroui/tabs';
import NextLink from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Plus,
  Zap,
  Crown,
  Shield,
  Star,
  Wallet,
  Building2,
  BarChart3,
  FileText,
  Upload,
  Globe,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Settings,
  Trash2
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useExtensionStore } from '@/stores';
import { useUIStore } from '@/stores';

const categories = [
  { key: 'all', label: 'All Categories' },
  { key: 'crypto', label: 'Cryptocurrency' },
  { key: 'banking', label: 'Banking & Finance' },
  { key: 'ecommerce', label: 'E-commerce' },
  { key: 'accounting', label: 'Accounting' },
  { key: 'file', label: 'File Processing' },
  { key: 'other', label: 'Other' }
];

const ExtensionCard = ({ extension, userExtension, onConnect, onDisconnect, onSync, onConfigure }) => {
  const { profile } = useAuth();
  const userTier = profile?.tier || 'free';
  const canUse = extension.tier_restrictions[userTier] === true;
  const isConnected = !!userExtension;

  const getSyncStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'syncing': return 'warning';
      default: return 'default';
    }
  };

  const getSyncStatusText = (status) => {
    switch (status) {
      case 'success': return 'Synced';
      case 'error': return 'Error';
      case 'syncing': return 'Syncing...';
      default: return 'Pending';
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${isConnected ? 'border-success-200 bg-success-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {extension.name.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{extension.name}</h3>
                {extension.is_featured && (
                  <Badge size="sm" color="warning" variant="flat">
                    Featured
                  </Badge>
                )}
                {isConnected && (
                  <Badge size="sm" color="success" variant="flat" startContent={<CheckCircle2 className="w-3 h-3" />}>
                    Connected
                  </Badge>
                )}
              </div>
              <p className="text-sm text-default-500 capitalize">{extension.category}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!canUse && (
              <Chip size="sm" color="warning" variant="flat" startContent={<Crown className="w-3 h-3" />}>
                Upgrade Required
              </Chip>
            )}
            {isConnected && (
              <Chip 
                size="sm" 
                color={getSyncStatusColor(userExtension.sync_status)}
                variant="flat"
              >
                {getSyncStatusText(userExtension.sync_status)}
              </Chip>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="pt-0">
        <p className="text-default-600 mb-4">{extension.description}</p>
        
        {extension.supported_data_types && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Supported Data Types:</p>
            <div className="flex flex-wrap gap-1">
              {extension.supported_data_types.map((type, index) => (
                <Chip key={index} size="sm" variant="flat" color="primary">
                  {type}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {isConnected ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Connection: {userExtension.connection_name}</span>
              <span className="text-default-500">
                Last sync: {userExtension.last_sync_at ? new Date(userExtension.last_sync_at).toLocaleDateString() : 'Never'}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                startContent={<RefreshCw className="w-4 h-4" />}
                onPress={() => onSync(userExtension.id)}
                isLoading={userExtension.sync_status === 'syncing'}
              >
                Sync Now
              </Button>
              <Button
                size="sm"
                variant="flat"
                startContent={<Settings className="w-4 h-4" />}
                onPress={() => onConfigure(userExtension)}
              >
                Configure
              </Button>
              <Button
                size="sm"
                variant="flat"
                color="danger"
                startContent={<Trash2 className="w-4 h-4" />}
                onPress={() => onDisconnect(userExtension.id)}
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <Button
            color="primary"
            className="w-full"
            startContent={<Plus className="w-4 h-4" />}
            onPress={() => onConnect(extension)}
            isDisabled={!canUse}
          >
            {canUse ? 'Connect Extension' : 'Upgrade to Connect'}
          </Button>
        )}
      </CardBody>
    </Card>
  );
};

export default function ExtensionsPage() {
  const { profile } = useAuth();
  const { addNotification } = useUIStore();
  const {
    extensions,
    userExtensions,
    searchQuery,
    selectedCategory,
    setSearchQuery,
    setSelectedCategory,
    connectExtension,
    disconnectExtension,
    syncExtension
  } = useExtensionStore();
  
  const [selectedExtension, setSelectedExtension] = useState(null);
  const [credentials, setCredentials] = useState({});
  const [connectionName, setConnectionName] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch extensions
  const { data: extensionsData, isLoading, error } = useQuery({
    queryKey: ['extensions'],
    queryFn: async () => {
      const response = await fetch('/api/extensions');
      if (!response.ok) throw new Error('Failed to fetch extensions');
      const result = await response.json();
      return result.data;
    }
  });

  // Fetch user extensions
  const { data: userExtensionsData } = useQuery({
    queryKey: ['user-extensions'],
    queryFn: async () => {
      const response = await fetch('/api/user-extensions');
      if (!response.ok) throw new Error('Failed to fetch user extensions');
      const result = await response.json();
      return result.data;
    }
  });

  // Filter extensions
  const filteredExtensions = extensionsData?.filter(extension => {
    const matchesSearch = !searchQuery || 
      extension.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      extension.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || extension.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const connectedExtensions = filteredExtensions.filter(ext => 
    userExtensionsData?.some(ue => ue.extension_id === ext.id)
  );

  const availableExtensions = filteredExtensions.filter(ext => 
    !userExtensionsData?.some(ue => ue.extension_id === ext.id)
  );

  const handleConnect = (extension) => {
    setSelectedExtension(extension);
    setConnectionName(`${extension.name} Connection`);
    setCredentials({});
    onOpen();
  };

  const handleSubmitConnection = async () => {
    if (!selectedExtension) return;

    try {
      await connectExtension(selectedExtension.id, credentials, connectionName);
      addNotification({
        type: 'success',
        title: 'Extension Connected',
        message: `Successfully connected ${selectedExtension.name}`
      });
      onClose();
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: error.message
      });
    }
  };

  const handleDisconnect = async (userExtensionId) => {
    try {
      await disconnectExtension(userExtensionId);
      addNotification({
        type: 'success',
        title: 'Extension Disconnected',
        message: 'Extension has been disconnected'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Disconnection Failed',
        message: error.message
      });
    }
  };

  const handleSync = async (userExtensionId) => {
    try {
      await syncExtension(userExtensionId);
      addNotification({
        type: 'success',
        title: 'Sync Started',
        message: 'Data synchronization has been initiated'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Sync Failed',
        message: error.message
      });
    }
  };

  const getUserExtension = (extensionId) => {
    return userExtensionsData?.find(ue => ue.extension_id === extensionId);
  };

  const getCredentialFields = (extension) => {
    const requiredFields = extension.required_fields || [];
    return requiredFields.map(field => {
      switch (field.toLowerCase()) {
        case 'api_key':
          return { key: 'apiKey', label: 'API Key', type: 'password', required: true };
        case 'secret_key':
          return { key: 'secretKey', label: 'Secret Key', type: 'password', required: true };
        case 'access_token':
          return { key: 'accessToken', label: 'Access Token', type: 'password', required: true };
        case 'client_id':
          return { key: 'clientId', label: 'Client ID', type: 'text', required: true };
        case 'shop_domain':
          return { key: 'shopDomain', label: 'Shop Domain', type: 'text', required: true };
        default:
          return { key: field, label: field.replace('_', ' '), type: 'text', required: true };
      }
    });
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to Load Extensions</h2>
        <p className="text-default-600">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Extensions
          </h1>
          <p className="text-default-500 mt-1">
            Connect your data sources and start aggregating
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Chip size="sm" color="primary" variant="flat">
            {connectedExtensions.length} Connected
          </Chip>
          <Button 
            as={NextLink}
            href="/extensions/add" 
            color="primary" 
            endContent={<Plus className="w-4 h-4" />}
          >
            Add Extension
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search extensions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startContent={<Search className="w-4 h-4 text-default-400" />}
          className="sm:max-w-md"
          variant="bordered"
        />
        
        <Select
          placeholder="All Categories"
          selectedKeys={[selectedCategory]}
          onSelectionChange={(keys) => setSelectedCategory(Array.from(keys)[0] as string)}
          className="sm:max-w-xs"
          variant="bordered"
        >
          {categories.map((category) => (
            <SelectItem key={category.key} value={category.key}>
              {category.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Content */}
      <Tabs defaultSelectedKey="all" className="w-full">
        <Tab key="all" title="All Extensions">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardBody className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-default-200 rounded-xl" />
                      <div className="space-y-2">
                        <div className="w-24 h-4 bg-default-200 rounded" />
                        <div className="w-16 h-3 bg-default-200 rounded" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-full h-3 bg-default-200 rounded" />
                      <div className="w-3/4 h-3 bg-default-200 rounded" />
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExtensions.map((extension) => (
                <ExtensionCard
                  key={extension.id}
                  extension={extension}
                  userExtension={getUserExtension(extension.id)}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onSync={handleSync}
                  onConfigure={(userExt) => {
                    // Handle configuration modal
                  }}
                />
              ))}
            </div>
          )}
        </Tab>

        <Tab key="connected" title={`Connected (${connectedExtensions.length})`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connectedExtensions.map((extension) => (
              <ExtensionCard
                key={extension.id}
                extension={extension}
                userExtension={getUserExtension(extension.id)}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onSync={handleSync}
                onConfigure={(userExt) => {
                  // Handle configuration modal
                }}
              />
            ))}
          </div>
        </Tab>

        <Tab key="available" title={`Available (${availableExtensions.length})`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableExtensions.map((extension) => (
              <ExtensionCard
                key={extension.id}
                extension={extension}
                userExtension={null}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
                onSync={handleSync}
                onConfigure={() => {}}
              />
            ))}
          </div>
        </Tab>
      </Tabs>

      {/* Connection Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <ModalHeader>
            Connect {selectedExtension?.name}
          </ModalHeader>
          <ModalBody>
            {selectedExtension && (
              <div className="space-y-4">
                <Input
                  label="Connection Name"
                  placeholder="Give this connection a name"
                  value={connectionName}
                  onChange={(e) => setConnectionName(e.target.value)}
                  variant="bordered"
                />
                
                {getCredentialFields(selectedExtension).map((field) => (
                  <Input
                    key={field.key}
                    label={field.label}
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    type={field.type}
                    value={credentials[field.key] || ''}
                    onChange={(e) => setCredentials(prev => ({
                      ...prev,
                      [field.key]: e.target.value
                    }))}
                    variant="bordered"
                    isRequired={field.required}
                  />
                ))}
                
                <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
                  <p className="text-warning-800 text-sm">
                    <strong>Security:</strong> Your credentials are encrypted and stored securely. 
                    We never share your data with third parties.
                  </p>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleSubmitConnection}
              isDisabled={!connectionName.trim() || !Object.keys(credentials).length}
            >
              Connect Extension
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}