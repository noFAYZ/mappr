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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Portfolio Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-lg font-semibold">Portfolio Performance</h3>
                <p className="text-sm text-default-500">Last 5 months</p>
              </div>
              <Button 
                size="sm" 
                variant="flat" 
                as={NextLink}
                href="/analytics"
                endContent={<ArrowUpRight className="w-3 h-3" />}
              >
                View Details
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData.chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8B5CF6" 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Asset Allocation */}
        <Card>
          <CardHeader className="pb-3">
            <div>
              <h3 className="text-lg font-semibold">Asset Allocation</h3>
              <p className="text-sm text-default-500">Current distribution</p>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={mockData.allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockData.allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {mockData.allocationData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-lg font-semibold">Recent Activity</h3>
                <p className="text-sm text-default-500">Latest updates</p>
              </div>
              <Button 
                size="sm" 
                variant="flat"
                as={NextLink}
                href="/activity"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {mockData.recentActivity.map((activity, index) => (
                <div key={activity.id}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-default-100 rounded-full">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-default-400">{activity.time}</p>
                    </div>
                    {activity.amount && (
                      <span className="text-sm font-medium text-success">
                        {activity.amount}
                      </span>
                    )}
                  </div>
                  {index < mockData.recentActivity.length - 1 && (
                    <Divider className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between w-full">
              <div>
                <h3 className="text-lg font-semibold">Top Performers</h3>
                <p className="text-sm text-default-500">Best performing assets</p>
              </div>
              <Button 
                size="sm" 
                variant="flat"
                as={NextLink}
                href="/portfolios/performance"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {mockData.topPerformers.map((performer, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{performer.name}</p>
                      <p className="text-xs text-default-400">{performer.value}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {performer.change > 0 ? (
                        <TrendingUp className="w-3 h-3 text-success" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-danger" />
                      )}
                      <span className={`text-sm font-medium ${
                        performer.change > 0 ? 'text-success' : 'text-danger'
                      }`}>
                        {performer.change > 0 ? '+' : ''}{performer.change}%
                      </span>
                    </div>
                  </div>
                  {index < mockData.topPerformers.length - 1 && (
                    <Divider className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <p className="text-sm text-default-500">Get started with these common tasks</p>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <Button
              as={NextLink}
              href="/extensions"
              variant="flat"
              className="h-20 flex-col gap-2 bg-primary-500/10 hover:bg-primary-500/20"
            >
              <Zap className="w-5 h-5 text-primary-600" />
              <span className="text-sm">Add Extension</span>
            </Button>

            <Button
              as={NextLink}
              href="/portfolios/create"
              variant="flat"
              className="h-20 flex-col gap-2 bg-secondary-500/10 hover:bg-secondary-500/20"
            >
              <PieChart className="w-5 h-5 text-secondary-600" />
              <span className="text-sm">Create Portfolio</span>
            </Button>

            <Button
              as={NextLink}
              href="/ai"
              variant="flat"
              className="h-20 flex-col gap-2 bg-warning-500/10 hover:bg-warning-500/20"
            >
              <Bot className="w-5 h-5 text-warning-600" />
              <span className="text-sm">Ask AI</span>
            </Button>

            <Button
              as={NextLink}
              href="/data"
              variant="flat"
              className="h-20 flex-col gap-2 bg-success-500/10 hover:bg-success-500/20"
            >
              <Activity className="w-5 h-5 text-success-600" />
              <span className="text-sm">View Data</span>
            </Button>

          </div>
        </CardBody>
      </Card>

    </div>
  );
}