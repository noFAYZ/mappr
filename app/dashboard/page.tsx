"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Progress } from "@heroui/progress";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import NextLink from "next/link";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Users, 
  PieChart,
  Plus,
  ArrowUpRight,
  Wallet,
  Building2,
  Bot,
  Zap,
  Crown,
  Shield
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

import { useAuth } from "@/contexts/AuthContext";

// Mock data - in real app, this would come from your APIs
const mockData = {
  totalValue: 127450.32,
  change24h: 5.67,
  connectedSources: 8,
  aiQueries: 47,
  portfolios: 3,
  recentActivity: [
    { id: 1, type: 'crypto', description: 'Portfolio sync completed', time: '2 min ago', amount: '+$1,234' },
    { id: 2, type: 'banking', description: 'Bank account connected', time: '1 hour ago', amount: null },
    { id: 3, type: 'business', description: 'Shopify data updated', time: '3 hours ago', amount: '+$892' },
    { id: 4, type: 'ai', description: 'AI analysis generated', time: '5 hours ago', amount: null },
  ],
  chartData: [
    { name: 'Jan', value: 85000 },
    { name: 'Feb', value: 92000 },
    { name: 'Mar', value: 88000 },
    { name: 'Apr', value: 115000 },
    { name: 'May', value: 127450 },
  ],
  allocationData: [
    { name: 'Crypto', value: 45, color: '#8B5CF6' },
    { name: 'Stocks', value: 30, color: '#06B6D4' },
    { name: 'Cash', value: 15, color: '#10B981' },
    { name: 'Other', value: 10, color: '#F59E0B' },
  ],
  topPerformers: [
    { name: 'Bitcoin Portfolio', change: 12.5, value: '$45,230' },
    { name: 'Tech Stocks', change: 8.2, value: '$32,100' },
    { name: 'DeFi Positions', change: -2.1, value: '$18,450' },
  ]
};

export default function DashboardPage() {
  const { profile } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>Loading...</div>;
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return <Chip size="sm" color="warning" variant="flat" startContent={<Crown className="w-3 h-3" />}>Enterprise</Chip>;
      case 'pro':
        return <Chip size="sm" color="secondary" variant="flat" startContent={<Shield className="w-3 h-3" />}>Pro</Chip>;
      default:
        return <Chip size="sm" color="default" variant="flat">Free</Chip>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'crypto': return <Wallet className="w-4 h-4 text-purple-500" />;
      case 'banking': return <Building2 className="w-4 h-4 text-blue-500" />;
      case 'business': return <PieChart className="w-4 h-4 text-green-500" />;
      case 'ai': return <Bot className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-default-500 mt-1">
            Here's your financial overview for today
          </p>
        </div>
        <div className="flex items-center gap-3">
          {profile && getTierBadge(profile?.tier)}
          <Button 
            as={NextLink}
            href="/extensions" 
            color="primary" 
            endContent={<Plus className="w-4 h-4" />}
          >
            Add Extension
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Value */}
        <Card className="bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border-primary-200/50">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500 font-medium">Total Value</p>
                <p className="text-2xl font-bold">${mockData.totalValue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">+{mockData.change24h}%</span>
                  <span className="text-xs text-default-400">24h</span>
                </div>
              </div>
              <div className="p-3 bg-primary-500/20 rounded-full">
                <DollarSign className="w-6 h-6 text-primary-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Connected Sources */}
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500 font-medium">Connected Sources</p>
                <p className="text-2xl font-bold">{mockData.connectedSources}</p>
                <p className="text-xs text-default-400 mt-1">Active integrations</p>
              </div>
              <div className="p-3 bg-secondary-500/20 rounded-full">
                <Zap className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* AI Queries */}
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500 font-medium">AI Queries</p>
                <p className="text-2xl font-bold">{mockData.aiQueries}</p>
                <p className="text-xs text-default-400 mt-1">This month</p>
              </div>
              <div className="p-3 bg-warning-500/20 rounded-full">
                <Bot className="w-6 h-6 text-warning-600" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Portfolios */}
        <Card>
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500 font-medium">Portfolios</p>
                <p className="text-2xl font-bold">{mockData.portfolios}</p>
                <p className="text-xs text-default-400 mt-1">Active portfolios</p>
              </div>
              <div className="p-3 bg-success-500/20 rounded-full">
                <PieChart className="w-6 h-6 text-success-600" />
              </div>
            </div>
          </CardBody>
        </Card>

      </div>


    </div>
  );
}