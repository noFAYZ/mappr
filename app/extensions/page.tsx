"use client";

import { useState, useMemo } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { Badge } from "@heroui/badge";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Tabs, Tab } from "@heroui/tabs";
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import NextLink from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
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
  Trash2,
  MoreVertical,
  Clock,
  TrendingUp,
  Users,
  Sparkles,
  Eye,
  Copy,
  Link2,
  Activity,
  Database,
  ArrowRight,
  ChevronDown,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  UploadCloud,
  Verified,
  VerifiedIcon,
  Check,
} from "lucide-react";

import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useExtensionStore } from '@/stores';
import { useUIStore } from '@/stores';
import { SolarWalletBoldDuotone } from "@/components/icons/icons";

const categories = [
  { key: "all", label: "All Categories", icon: Grid3X3, color: "default" },
  { key: "crypto", label: "Cryptocurrency", icon: SolarWalletBoldDuotone, color: "warning" },
  {
    key: "banking",
    label: "Banking & Finance",
    icon: Building2,
    color: "success",
  },
  { key: "ecommerce", label: "E-commerce", icon: BarChart3, color: "primary" },
  {
    key: "accounting",
    label: "Accounting",
    icon: FileText,
    color: "secondary",
  },
  { key: "file", label: "File Processing", icon: UploadCloud, color: "danger" },
  { key: "other", label: "Other", icon: Globe, color: "default" },
];

const sortOptions = [
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "popularity", label: "Popularity" },
  { key: "recent", label: "Recently Added" },
];

const ExtensionCard = ({
  extension,
  userExtension,
  onConnect,
  onDisconnect,
  onSync,
  onConfigure,
  viewMode = "grid",
}) => {
  const { profile } = useAuth();
  const userTier = profile?.tier || "free";
  const canUse = extension.tier_restrictions?.[userTier] === true;
  const isConnected = !!userExtension;

  const getSyncStatusColor = (status) => {
    switch (status) {
      case "success":
        return "success";
      case "error":
        return "danger";
      case "syncing":
        return "warning";
      default:
        return "default";
    }
  };

  const getSyncStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-3 h-3" />;
      case "error":
        return <AlertCircle className="w-3 h-3" />;
      case "syncing":
        return <RefreshCw className="w-3 h-3 animate-spin" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getCategoryIcon = (category) => {
    const categoryData = categories.find((cat) => cat.key === category);
    const IconComponent = categoryData?.icon || Globe;

    return <IconComponent className="w-3.5 h-3.5" />;
  };

  const getCategoryColor = (category) => {
    const categoryData = categories.find((cat) => cat.key === category);
    return categoryData?.color || "default";
  };

  if (viewMode === "list") {
    return (
      <motion.div
        animate={{ opacity: 1, x: 0 }}
        initial={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card
          className={`transition-all duration-200 hover:shadow-md border-l-4 ${
            isConnected
              ? "border-l-success bg-success-50/20 dark:bg-success-950/10"
              : "border-l-transparent"
          }`}
        >
          <CardBody className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Avatar
                  className="bg-gradient-to-br from-primary to-secondary text-white shrink-0"
                  fallback={extension.name.charAt(0)}
                  name={extension.name}
                  size="md"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{extension.name}</h3>
                    {extension.is_featured && (
                      <Badge
                        size="sm"
                        color="warning"
                        variant="flat"
                        content={<Star className="w-3 h-3" />}
                      />
                    )}
                    {isConnected && (
                      <Badge
                        size="sm"
                        color="success"
                        variant="flat"
                        content={getSyncStatusIcon(userExtension?.sync_status)}
                      />
                    )}
                  </div>
                  <p className="text-sm text-default-500 line-clamp-1">
                    {extension.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Chip
                      color={getCategoryColor(extension.category)}
                      size="sm"
                      startContent={getCategoryIcon(extension.category)}
                      variant="flat"
                    >
                      {extension.category}
                    </Chip>
                    {extension.supported_data_types
                      ?.slice(0, 2)
                      .map((type, index) => (
                        <Chip
                          key={index}
                          size="sm"
                          variant="bordered"
                          className="text-xs"
                        >
                          {type}
                        </Chip>
                      ))}
                    {extension.supported_data_types?.length > 2 && (
                      <span className="text-xs text-default-400">
                        +{extension.supported_data_types.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {!canUse && (
                  <Chip
                    size="sm"
                    color="warning"
                    variant="flat"
                    startContent={<Crown className="w-3 h-3" />}
                  >
                    Pro
                  </Chip>
                )}

                {isConnected ? (
                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm">
                      <p className="font-medium text-success">Connected</p>
                      <p className="text-xs text-default-500">
                        {userExtension?.last_sync_at
                          ? `Synced ${new Date(userExtension.last_sync_at).toLocaleDateString()}`
                          : "Never synced"}
                      </p>
                    </div>
                    <Dropdown>
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="flat">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem
                          key="sync"
                          startContent={<RefreshCw className="w-4 h-4" />}
                          onPress={() => onSync(userExtension.id)}
                        >
                          Sync Now
                        </DropdownItem>
                        <DropdownItem
                          key="configure"
                          startContent={<Settings className="w-4 h-4" />}
                          onPress={() => onConfigure(userExtension)}
                        >
                          Configure
                        </DropdownItem>
                        <DropdownItem
                          key="disconnect"
                          className="text-danger"
                          color="danger"
                          startContent={<Trash2 className="w-4 h-4" />}
                          onPress={() => onDisconnect(userExtension.id)}
                        >
                          Disconnect
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                ) : (
                  <Button
                    color="primary"
                    isDisabled={!canUse}
                    size="sm"
                    startContent={<Plus className="w-4 h-4" />}
                    onPress={() => onConnect(extension)}
                  >
                    {canUse ? "Connect" : "Upgrade"}
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 20 }}
 
    >
      <Card
        className={`h-full hover:shadow-xl border border-divider group `}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar
                  className="bg-gradient-to-br from-primary-500 to-secondary-500 text-white rounded-2xl"
                  fallback={extension.name.charAt(0)}
                  name={extension.name}
                  size="md"
                />
                {isConnected && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {extension.name}
                  </h3>
                  {extension.is_featured && (
                   <Star className="w-3 h-3 text-yellow-600" fill="yellow" /> 
                  )}
                </div>
                <Chip
                  className="capitalize text-[10px] h-5 rounded-md"
                  color={getCategoryColor(extension.category)}
                  size="sm"
                  startContent={getCategoryIcon(extension.category)}
                  variant="flat"
                >
                  {extension.category}
                </Chip>
              </div>
            </div>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  size="sm"
                  variant="light"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem startContent={<Eye className="w-4 h-4" />}>
                  View Details
                </DropdownItem>
                <DropdownItem
                  startContent={<ExternalLink className="w-4 h-4" />}
                >
                  Documentation
                </DropdownItem>
                <DropdownItem startContent={<Copy className="w-4 h-4" />}>
                  Copy API Info
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </CardHeader>

        <CardBody className="pt-0 flex flex-col h-full">
          <p className="text-default-600 mb-4 text-xs leading-relaxed flex-1">
            {extension.description}
          </p>

          {extension.supported_data_types && (
            <div className="mb-4">
              <p className="text-xs font-medium text-default-500 mb-2 uppercase tracking-wide">
                Data Types
              </p>
              <div className="flex flex-wrap gap-1">
                {extension.supported_data_types
                  .slice(0, 3)
                  .map((type, index) => (
                    <Chip
                      key={index}
                      size="sm"
                      variant="bordered"
                      className="text-xs"
                    >
                      {type}
                    </Chip>
                  ))}
                {extension.supported_data_types.length > 3 && (
                  <Chip className="text-xs" size="sm" variant="flat">
                    +{extension.supported_data_types.length - 3}
                  </Chip>
                )}
              </div>
            </div>
          )}

          <div className="mt-auto space-y-3">
            {!canUse && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-warning-50 border border-warning-200 dark:bg-warning-950/20 dark:border-warning-900/50">
                <Crown className="w-4 h-4 text-warning" />
                <span className="text-sm text-warning-700 dark:text-warning-300">
                  Upgrade required
                </span>
              </div>
            )}

            {isConnected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <span className="font-medium">
                      {userExtension.connection_name}
                    </span>
                  </div>
                  <Chip
                    color={getSyncStatusColor(userExtension.sync_status)}
                    size="sm"
                    startContent={getSyncStatusIcon(userExtension.sync_status)}
                    variant="flat"
                  >
                    {userExtension.sync_status}
                  </Chip>
                </div>

                {userExtension.last_sync_at && (
                  <div className="text-xs text-default-500">
                    Last sync:{" "}
                    {new Date(userExtension.last_sync_at).toLocaleString()}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    color="primary"
                    isLoading={userExtension.sync_status === 'syncing'}
                    size="sm"
                    startContent={<RefreshCw className="w-4 h-4" />}
                    variant="flat"
                    onPress={() => onSync(userExtension.id)}
                  >
                    {userExtension.sync_status === "syncing"
                      ? "Syncing..."
                      : "Sync"}
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    startContent={<Settings className="w-4 h-4" />}
                    variant="flat"
                    onPress={() => onConfigure(userExtension)}
                  />
                  <Button
                    isIconOnly
                    color="danger"
                    size="sm"
                    startContent={<Trash2 className="w-4 h-4" />}
                    variant="flat"
                    onPress={() => onDisconnect(userExtension.id)}
                  />
                </div>
              </div>
            ) : (
              <Button
                className=" w-full bg-gradient-to-br from-orange-500 to-pink-500 text-white/90"
                variant="flat"
               size="sm"
                endContent={<ArrowRight className="w-4 h-4" />}
                isDisabled={!canUse}
                startContent={<Plus className="w-4 h-4" />}
                onPress={() => onConnect(extension)}
              >
                {canUse ? "Connect Extension" : "Upgrade to Connect"}
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

const ExtensionStats = ({ extensions, userExtensions, isLoading }) => {
  const stats = useMemo(() => {
    if (isLoading || !extensions) return null;

    const connected = userExtensions?.length || 0;
    const available = extensions.length;
    const categories = [...new Set(extensions.map((ext) => ext.category))]
      .length;
    const syncing =
      userExtensions?.filter((ue) => ue.sync_status === "syncing").length || 0;

    return { connected, available, categories, syncing };
  }, [extensions, userExtensions, isLoading]);

  if (isLoading || !stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardBody className="text-center py-4">
          <div className="text-2xl font-bold text-success">
            {stats.connected}
          </div>
          <div className="text-sm text-default-500">Connected</div>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="text-center py-4">
          <div className="text-2xl font-bold text-primary">
            {stats.available}
          </div>
          <div className="text-sm text-default-500">Available</div>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="text-center py-4">
          <div className="text-2xl font-bold text-secondary">
            {stats.categories}
          </div>
          <div className="text-sm text-default-500">Categories</div>
        </CardBody>
      </Card>
      <Card>
        <CardBody className="text-center py-4">
          <div className="text-2xl font-bold text-warning">{stats.syncing}</div>
          <div className="text-sm text-default-500">Syncing</div>
        </CardBody>
      </Card>
    </div>
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
    syncExtension,
  } = useExtensionStore();

  const [selectedExtension, setSelectedExtension] = useState(null);
  const [credentials, setCredentials] = useState({});
  const [connectionName, setConnectionName] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedTab, setSelectedTab] = useState("all");

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch extensions
  const {
    data: extensionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["extensions"],
    queryFn: async () => {
      const response = await fetch("/api/extensions");
      if (!response.ok) throw new Error("Failed to fetch extensions");
      const result = await response.json();

      return result.data;
    },
  });

  // Fetch user extensions
  const { data: userExtensionsData } = useQuery({
    queryKey: ["user-extensions"],
    queryFn: async () => {
      const response = await fetch("/api/user-extensions");
      if (!response.ok) throw new Error("Failed to fetch user extensions");
      const result = await response.json();

      return result.data;
    },
  });

  // Filter and sort extensions
  const processedExtensions = useMemo(() => {
    let filtered =
      extensionsData?.filter((extension) => {
        const matchesSearch =
          !searchQuery ||
          extension.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          extension.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === "all" || extension.category === selectedCategory;

        return matchesSearch && matchesCategory;
      }) || [];

    // Sort extensions
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "category":
          aValue = a.category;
          bValue = b.category;
          break;
        case "popularity":
          // Mock popularity - in real app, use actual metrics
          aValue = a.connections || 0;
          bValue = b.connections || 0;
          break;
        case "recent":
          aValue = new Date(a.created_at || 0).getTime();
          bValue = new Date(b.created_at || 0).getTime();
          break;
        default:
          return 0;
      }

      if (typeof aValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [extensionsData, searchQuery, selectedCategory, sortBy, sortOrder]);

  const connectedExtensions = processedExtensions.filter((ext) =>
    userExtensionsData?.some((ue) => ue.extension_id === ext.id),
  );

  const availableExtensions = processedExtensions.filter(
    (ext) => !userExtensionsData?.some((ue) => ue.extension_id === ext.id),
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
      toast.success(`Successfully connected ${selectedExtension.name}`);
      onClose();
      setCredentials({});
      setConnectionName("");
    } catch (error) {
      toast.error(`Connection failed: ${error.message}`);
    }
  };

  const handleDisconnect = async (userExtensionId) => {
    try {
      await disconnectExtension(userExtensionId);
      toast.success("Extension disconnected successfully");
    } catch (error) {
      toast.error(`Disconnection failed: ${error.message}`);
    }
  };

  const handleSync = async (userExtensionId) => {
    try {
      await syncExtension(userExtensionId);
      toast.success("Sync initiated successfully");
    } catch (error) {
      toast.error(`Sync failed: ${error.message}`);
    }
  };

  const getUserExtension = (extensionId) => {
    return userExtensionsData?.find((ue) => ue.extension_id === extensionId);
  };

  const getCredentialFields = (extension) => {
    const requiredFields = extension.required_fields || [];

    return requiredFields.map((field) => {
      switch (field.toLowerCase()) {
        case "api_key":
          return {
            key: "apiKey",
            label: "API Key",
            type: "password",
            required: true,
            description: "Your API key from the service",
          };
        case "secret_key":
          return {
            key: "secretKey",
            label: "Secret Key",
            type: "password",
            required: true,
            description: "Your secret key for authentication",
          };
        case "access_token":
          return {
            key: "accessToken",
            label: "Access Token",
            type: "password",
            required: true,
            description: "Your access token",
          };
        case "client_id":
          return {
            key: "clientId",
            label: "Client ID",
            type: "text",
            required: true,
            description: "Your application client ID",
          };
        case "shop_domain":
          return {
            key: "shopDomain",
            label: "Shop Domain",
            type: "text",
            required: true,
            description: "Your shop domain (without protocol)",
          };
        default:
          return {
            key: field,
            label: field.replace("_", " "),
            type: "text",
            required: true,
            description: `Enter your ${field.replace("_", " ").toLowerCase()}`,
          };
      }
    });
  };

  const getTabContent = () => {
    switch (selectedTab) {
      case "connected":
        return connectedExtensions;
      case "available":
        return availableExtensions;
      default:
        return processedExtensions;
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="max-w-md">
          <CardBody className="text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-danger mx-auto" />
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Failed to Load Extensions
              </h2>
              <p className="text-default-600">{error.message}</p>
            </div>
            <Button color="primary" onPress={() => window.location.reload()}>
              Try Again
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Extensions
            </h1>
            <p className="text-default-500 mt-1 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Connect your data sources and start aggregating insights
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              as={NextLink}
              href="/extensions/browse"
              startContent={<Sparkles className="w-4 h-4" />}
              variant="flat"
            >
              Explore More
            </Button>
            <Button
              color="primary" 
              endContent={<ArrowRight className="w-4 h-4" />}
              startContent={<Plus className="w-4 h-4" />}
            >
              Request Extension
            </Button>
          </div>
        </div>

        {/* Stats */}
        <ExtensionStats
          extensions={extensionsData} 
          isLoading={isLoading} 
          userExtensions={userExtensionsData} 
        />
      </div>

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-1">
              <Input
                className="sm:max-w-xs"
                placeholder="Search extensions..."
                size="sm"
                startContent={<Search className="w-4 h-4 text-default-400" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <Select
                className="sm:max-w-xs"
                placeholder="Category"
                selectedKeys={selectedCategory ? [selectedCategory] : []}
                size="sm"
                startContent={<Filter className="w-4 h-4" />}
                onSelectionChange={(keys) => setSelectedCategory(Array.from(keys)[0] as string || 'all')}
              >
                {categories.map((category) => (
                  <SelectItem
                    key={category.key}
                    startContent={<category.icon className="w-4 h-4" />}
                  >
                    {category.label}
                  </SelectItem>
                ))}
              </Select>

              <Dropdown>
                <DropdownTrigger>
                  <Button
                    endContent={<ChevronDown className="w-4 h-4" />} 
                    size="sm"
                    startContent={sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                    variant="flat"
                  >
                    Sort: {sortOptions.find((opt) => opt.key === sortBy)?.label}
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  selectedKeys={[sortBy]}
                  onSelectionChange={(keys) =>
                    setSortBy(Array.from(keys)[0] as string)
                  }
                >
                  {sortOptions.map((option) => (
                    <DropdownItem key={option.key}>{option.label}</DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            </div>

            <div className="flex items-center gap-2">
              <Tabs
                selectedKey={viewMode}
                size="sm"
                variant="light"
                onSelectionChange={(key) => setViewMode(key as string)}
              >
                <Tab key="grid" title={<Grid3X3 className="w-4 h-4" />} />
                <Tab key="list" title={<List className="w-4 h-4" />} />
              </Tabs>

              <Button
                size="sm"
                startContent={sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                variant="flat"
                onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Content */}
      <Tabs
        className="w-full"
        classNames={{
          tabList: "bg-default-100 p-1 rounded-2xl border border-divider",
          cursor: "bg-default-50 shadow-sm rounded-2xl",
          tab: "h-9",
          tabContent: "text-xs font-medium group-data-[selected=true]:text-primary-600"
        }}
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
      >
        <Tab
          key="all"
          title={
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              <span>All Extensions</span>
              <Chip className="ml-1 bg-primary-500/20 text-primary-700 text-[10px] h-5 px-0.5 rounded-md" size="sm" variant="flat" >
                {processedExtensions.length}
              </Chip>
            </div>
          }
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                animate={{ opacity: 1 }}
                className={viewMode === 'grid' ? 
                  'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6' : 
                  'space-y-3'
                }
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
              >
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardBody className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-default-200 rounded-xl" />
                        <div className="space-y-2 flex-1">
                          <div className="w-3/4 h-4 bg-default-200 rounded" />
                          <div className="w-1/2 h-3 bg-default-200 rounded" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full h-3 bg-default-200 rounded" />
                        <div className="w-4/5 h-3 bg-default-200 rounded" />
                        <div className="w-full h-8 bg-default-200 rounded mt-4" />
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </motion.div>
            ) : processedExtensions.length === 0 ? (
              <motion.div
                key="empty"
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
                exit={{ opacity: 0, y: -20 }}
                initial={{ opacity: 0, y: 20 }}
              >
                <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-default-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No extensions found
                </h3>
                <p className="text-default-500 mb-4">
                  Try adjusting your search criteria or browse different
                  categories.
                </p>
                <Button
                  variant="flat"
                  onPress={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear Filters
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                animate={{ opacity: 1 }}
                className={viewMode === 'grid' ? 
                  'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6' : 
                  'space-y-3'
                }
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
              >
                {processedExtensions.map((extension, index) => (
                  <ExtensionCard
                    key={extension.id}
                    extension={extension}
                    userExtension={getUserExtension(extension.id)}
                    viewMode={viewMode}
                    onConfigure={(userExt) => {
                      toast.info('Configuration modal coming soon!');
                    }}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    onSync={handleSync}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Tab>

        <Tab
          key="connected"
          title={
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Connected</span>
              <Chip className="ml-1 text-[10px] h-5 px-0.5 rounded-md" color="success" size="sm" variant="flat">
                {connectedExtensions.length}
              </Chip>
            </div>
          }
        >
          <AnimatePresence mode="wait">
            {connectedExtensions.length === 0 ? (
              <motion.div
                key="empty-connected"
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
                exit={{ opacity: 0, y: -20 }}
                initial={{ opacity: 0, y: 20 }}
              >
                <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No connected extensions
                </h3>
                <p className="text-default-500 mb-4">
                  Connect your first extension to start aggregating data.
                </p>
                <Button
                  color="primary"
                  startContent={<Plus className="w-4 h-4" />}
                  onPress={() => setSelectedTab("available")}
                >
                  Browse Extensions
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="connected-content"
                animate={{ opacity: 1 }}
                className={viewMode === 'grid' ? 
                  'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6' : 
                  'space-y-3'
                }
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
              >
                {connectedExtensions.map((extension) => (
                  <ExtensionCard
                    key={extension.id}
                    extension={extension}
                    userExtension={getUserExtension(extension.id)}
                    viewMode={viewMode}
                    onConfigure={(userExt) => {
                      toast.info('Configuration modal coming soon!');
                    }}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    onSync={handleSync}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Tab>

        <Tab
          key="available"
          title={
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Available</span>
              <Chip className="ml-1" color="primary" size="sm" variant="flat">
                {availableExtensions.length}
              </Chip>
            </div>
          }
        >
          <AnimatePresence mode="wait">
            <motion.div
              key="available-content"
              animate={{ opacity: 1 }}
              className={viewMode === 'grid' ? 
                'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6' : 
                'space-y-3'
              }
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
            >
              {availableExtensions.map((extension) => (
                <ExtensionCard
                  key={extension.id}
                  extension={extension}
                  userExtension={null}
                  viewMode={viewMode}
                  onConfigure={() => {}}
                  onConnect={handleConnect}
                  onDisconnect={handleDisconnect}
                  onSync={handleSync}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </Tab>
      </Tabs>

      {/* Connection Modal */}
      <Modal
        classNames={{
          backdrop: "bg-background/50 backdrop-blur-sm",
          base: "border border-default-200",
          header: "border-b border-default-200",
          footer: "border-t border-default-200"
        }} 
        isOpen={isOpen} 
        size="lg"
        onClose={onClose}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
              <Link2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                Connect {selectedExtension?.name}
              </h3>
              <p className="text-sm text-default-500">
                Secure connection to {selectedExtension?.name}
              </p>
            </div>
          </ModalHeader>
          <ModalBody className="space-y-6">
            {selectedExtension && (
              <>
                <Input
                  description="This helps you identify the connection later"
                  label="Connection Name"
                  placeholder="Give this connection a memorable name"
                  startContent={<Settings className="w-4 h-4 text-default-400" />}
                  value={connectionName}
                  variant="bordered"
                  onChange={(e) => setConnectionName(e.target.value)}
                />

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">Credentials</h4>
                  </div>

                  {getCredentialFields(selectedExtension).map((field) => (
                    <Input
                      key={field.key}
                      description={field.description}
                      isRequired={field.required}
                      label={field.label}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      startContent={
                        field.type === 'password' ? 
                          <Shield className="w-4 h-4 text-default-400" /> :
                          <Database className="w-4 h-4 text-default-400" />
                      }
                      type={field.type}
                      value={credentials[field.key] || ''}
                      variant="bordered"
                      onChange={(e) => setCredentials(prev => ({
                        ...prev,
                        [field.key]: e.target.value
                      }))}
                      
                    />
                  ))}
                </div>

                <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg dark:from-primary-950/20 dark:to-secondary-950/20 dark:border-primary-800/50">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-primary mb-1">
                        Security & Privacy
                      </p>
                      <ul className="text-primary/80 space-y-1 text-xs">
                        <li>
                          • All credentials are encrypted using AES-256
                          encryption
                        </li>
                        <li>
                          • We never store or share your data with third parties
                        </li>
                        <li>
                          • You can disconnect and delete credentials anytime
                        </li>
                        <li>
                          • Data is processed securely in compliance with
                          privacy laws
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary" 
              isDisabled={!connectionName.trim() || !Object.keys(credentials).length}
              startContent={<Link2 className="w-4 h-4" />}
              onPress={handleSubmitConnection}
            >
              Connect Extension
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
