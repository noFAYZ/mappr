"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import NextLink from "next/link";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  PieChart,
  BarChart3,
  Wallet,
  DollarSign,
  Edit,
  Trash2,
  Copy,
  Eye,
  Settings,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

import { useAuth } from "@/contexts/AuthContext";

// Mock portfolio data
const mockPortfolios = [
  {
    id: "1",
    name: "Crypto Portfolio",
    description: "My main cryptocurrency investments",
    totalValue: 127450.32,
    change24h: 5.67,
    change7d: -2.34,
    change30d: 15.23,
    itemCount: 8,
    lastUpdated: "2 minutes ago",
    performance: [
      { date: "2024-01", value: 85000 },
      { date: "2024-02", value: 92000 },
      { date: "2024-03", value: 88000 },
      { date: "2024-04", value: 115000 },
      { date: "2024-05", value: 127450 },
    ],
    isDefault: true,
  },
  {
    id: "2",
    name: "Business Analytics",
    description: "E-commerce and business data tracking",
    totalValue: 89234.56,
    change24h: -1.23,
    change7d: 8.91,
    change30d: 22.45,
    itemCount: 5,
    lastUpdated: "1 hour ago",
    performance: [
      { date: "2024-01", value: 65000 },
      { date: "2024-02", value: 71000 },
      { date: "2024-03", value: 78000 },
      { date: "2024-04", value: 82000 },
      { date: "2024-05", value: 89234 },
    ],
    isDefault: false,
  },
  {
    id: "3",
    name: "Personal Finance",
    description: "Banking and personal accounts overview",
    totalValue: 45678.9,
    change24h: 0.89,
    change7d: 1.45,
    change30d: 3.67,
    itemCount: 12,
    lastUpdated: "3 hours ago",
    performance: [
      { date: "2024-01", value: 42000 },
      { date: "2024-02", value: 43000 },
      { date: "2024-03", value: 44500 },
      { date: "2024-04", value: 45000 },
      { date: "2024-05", value: 45678 },
    ],
    isDefault: false,
  },
];

export default function PortfoliosPage() {
  const { profile } = useAuth();
  const [portfolios, setPortfolios] = useState(mockPortfolios);
  const [selectedPortfolio, setSelectedPortfolio] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalType, setModalType] = useState<"create" | "edit" | "delete">(
    "create",
  );

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const totalValue = portfolios.reduce(
    (sum, portfolio) => sum + portfolio.totalValue,
    0,
  );
  const averageChange =
    portfolios.reduce((sum, portfolio) => sum + portfolio.change24h, 0) /
    portfolios.length;

  const openCreateModal = () => {
    setModalType("create");
    setFormData({ name: "", description: "" });
    onOpen();
  };

  const openEditModal = (portfolio: any) => {
    setModalType("edit");
    setSelectedPortfolio(portfolio);
    setFormData({ name: portfolio.name, description: portfolio.description });
    onOpen();
  };

  const openDeleteModal = (portfolio: any) => {
    setModalType("delete");
    setSelectedPortfolio(portfolio);
    onOpen();
  };

  const handleSubmit = () => {
    if (modalType === "create") {
      const newPortfolio = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        totalValue: 0,
        change24h: 0,
        change7d: 0,
        change30d: 0,
        itemCount: 0,
        lastUpdated: "Just now",
        performance: [],
        isDefault: false,
      };

      setPortfolios([...portfolios, newPortfolio]);
    } else if (modalType === "edit") {
      setPortfolios(
        portfolios.map((p) =>
          p.id === selectedPortfolio.id
            ? { ...p, name: formData.name, description: formData.description }
            : p,
        ),
      );
    } else if (modalType === "delete") {
      setPortfolios(portfolios.filter((p) => p.id !== selectedPortfolio.id));
    }
    onClose();
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? "text-success" : "text-danger";
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? (
      <TrendingUp className="w-3 h-3" />
    ) : (
      <TrendingDown className="w-3 h-3" />
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Portfolios
          </h1>
          <p className="text-default-500 mt-1">
            Manage and track your data portfolios
          </p>
        </div>
        <Button
          color="primary"
          endContent={<Plus className="w-4 h-4" />}
          onPress={openCreateModal}
        >
          Create Portfolio
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border-primary-200/50">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500 font-medium">
                  Total Value
                </p>
                <p className="text-2xl font-bold">
                  ${totalValue.toLocaleString()}
                </p>
                <div
                  className={`flex items-center gap-1 mt-1 ${getChangeColor(averageChange)}`}
                >
                  {getChangeIcon(averageChange)}
                  <span className="text-xs">
                    {averageChange >= 0 ? "+" : ""}
                    {averageChange.toFixed(2)}%
                  </span>
                  <span className="text-xs text-default-400">24h avg</span>
                </div>
              </div>
              <div className="p-3 bg-primary-500/20 rounded-full">
                <DollarSign className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500 font-medium">
                  Active Portfolios
                </p>
                <p className="text-2xl font-bold">{portfolios.length}</p>
                <p className="text-xs text-default-400 mt-1">
                  {portfolios.filter((p) => p.isDefault).length} default
                </p>
              </div>
              <div className="p-3 bg-secondary-500/20 rounded-full">
                <PieChart className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500 font-medium">
                  Total Items
                </p>
                <p className="text-2xl font-bold">
                  {portfolios.reduce((sum, p) => sum + p.itemCount, 0)}
                </p>
                <p className="text-xs text-default-400 mt-1">
                  Connected sources
                </p>
              </div>
              <div className="p-3 bg-success-500/20 rounded-full">
                <Wallet className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500 font-medium">
                  Performance
                </p>
                <p className="text-2xl font-bold text-success">+12.4%</p>
                <p className="text-xs text-default-400 mt-1">30d average</p>
              </div>
              <div className="p-3 bg-warning-500/20 rounded-full">
                <BarChart3 className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {portfolios.map((portfolio) => (
          <Card
            key={portfolio.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{portfolio.name}</h3>
                      {portfolio.isDefault && (
                        <Chip color="primary" size="sm" variant="flat">
                          Default
                        </Chip>
                      )}
                    </div>
                    <p className="text-xs text-default-500">
                      {portfolio.itemCount} items
                    </p>
                  </div>
                </div>

                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="flat">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Portfolio actions">
                    <DropdownItem
                      key="view"
                      href={`/portfolios/${portfolio.id}`}
                      startContent={<Eye className="w-4 h-4" />}
                    >
                      View Details
                    </DropdownItem>
                    <DropdownItem
                      key="edit"
                      startContent={<Edit className="w-4 h-4" />}
                      onPress={() => openEditModal(portfolio)}
                    >
                      Edit Portfolio
                    </DropdownItem>
                    <DropdownItem
                      key="duplicate"
                      startContent={<Copy className="w-4 h-4" />}
                    >
                      Duplicate
                    </DropdownItem>
                    <DropdownItem
                      key="settings"
                      startContent={<Settings className="w-4 h-4" />}
                    >
                      Settings
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      color="danger"
                      startContent={<Trash2 className="w-4 h-4" />}
                      onPress={() => openDeleteModal(portfolio)}
                    >
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </CardHeader>

            <CardBody className="pt-0">
              <div className="space-y-4">
                {/* Value and Performance */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">
                      ${portfolio.totalValue.toLocaleString()}
                    </span>
                    <div
                      className={`flex items-center gap-1 ${getChangeColor(portfolio.change24h)}`}
                    >
                      {getChangeIcon(portfolio.change24h)}
                      <span className="text-sm font-medium">
                        {portfolio.change24h >= 0 ? "+" : ""}
                        {portfolio.change24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-default-600 mb-3">
                    {portfolio.description}
                  </p>

                  {/* Mini Chart */}
                  {portfolio.performance.length > 0 && (
                    <div className="h-20 mb-3">
                      <ResponsiveContainer height="100%" width="100%">
                        <AreaChart data={portfolio.performance}>
                          <defs>
                            <linearGradient
                              id={`gradient-${portfolio.id}`}
                              x1="0"
                              x2="0"
                              y1="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#8B5CF6"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="#8B5CF6"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <Area
                            dataKey="value"
                            fill={`url(#gradient-${portfolio.id})`}
                            fillOpacity={1}
                            stroke="#8B5CF6"
                            strokeWidth={2}
                            type="monotone"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Performance Stats */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xs text-default-500">24h</p>
                      <p
                        className={`text-sm font-medium ${getChangeColor(portfolio.change24h)}`}
                      >
                        {portfolio.change24h >= 0 ? "+" : ""}
                        {portfolio.change24h.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-default-500">7d</p>
                      <p
                        className={`text-sm font-medium ${getChangeColor(portfolio.change7d)}`}
                      >
                        {portfolio.change7d >= 0 ? "+" : ""}
                        {portfolio.change7d.toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-default-500">30d</p>
                      <p
                        className={`text-sm font-medium ${getChangeColor(portfolio.change30d)}`}
                      >
                        {portfolio.change30d >= 0 ? "+" : ""}
                        {portfolio.change30d.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center justify-between text-xs text-default-500 pt-3 border-t border-default-200">
                  <span>Last updated: {portfolio.lastUpdated}</span>
                  <Button
                    as={NextLink}
                    color="primary"
                    href={`/portfolios/${portfolio.id}`}
                    size="sm"
                    variant="flat"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Create/Edit/Delete Modal */}
      <Modal isOpen={isOpen} size="lg" onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {modalType === "create" && "Create New Portfolio"}
            {modalType === "edit" && "Edit Portfolio"}
            {modalType === "delete" && "Delete Portfolio"}
          </ModalHeader>
          <ModalBody>
            {modalType === "delete" ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-danger-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Delete Portfolio</h3>
                <p className="text-default-600 mb-4">
                  Are you sure you want to delete "{selectedPortfolio?.name}"?
                  This action cannot be undone.
                </p>
                <div className="bg-warning-50 border border-warning-200 rounded-lg p-3">
                  <p className="text-warning-800 text-sm">
                    All portfolio items and historical data will be permanently
                    removed.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  isRequired
                  label="Portfolio Name"
                  placeholder="Enter portfolio name"
                  value={formData.name}
                  variant="bordered"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
                <Textarea
                  label="Description"
                  minRows={3}
                  placeholder="Describe this portfolio's purpose"
                  value={formData.description}
                  variant="bordered"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color={modalType === "delete" ? "danger" : "primary"}
              isDisabled={modalType !== "delete" && !formData.name.trim()}
              onPress={handleSubmit}
            >
              {modalType === "create" && "Create Portfolio"}
              {modalType === "edit" && "Save Changes"}
              {modalType === "delete" && "Delete Portfolio"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
