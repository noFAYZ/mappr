"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Download,
  Filter,
  RefreshCw,
  Calendar,
  Activity,
  Wallet,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useUIStore } from "@/stores";

const COLORS = [
  "#8B5CF6",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#6366F1",
];

const DataMetrics = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardBody className="p-6">
              <div className="space-y-3">
                <div className="w-16 h-16 bg-default-200 rounded-full" />
                <div className="w-20 h-4 bg-default-200 rounded" />
                <div className="w-32 h-6 bg-default-200 rounded" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  const totalValue =
    data?.reduce(
      (sum, item) => sum + (parseFloat(item.normalized_data?.amount) || 0),
      0,
    ) || 0;
  const totalRecords = data?.length || 0;
  const uniqueTypes = new Set(data?.map((item) => item.data_type) || []).size;
  const recentRecords =
    data?.filter((item) => {
      const createdDate = new Date(item.created_at);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      return createdDate > dayAgo;
    }).length || 0;

  return (
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
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-success" />
                <span className="text-xs text-success">Live data</span>
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
                Total Records
              </p>
              <p className="text-2xl font-bold">
                {totalRecords.toLocaleString()}
              </p>
              <p className="text-xs text-default-400 mt-1">All time</p>
            </div>
            <div className="p-3 bg-secondary-500/20 rounded-full">
              <Activity className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-default-500 font-medium">Data Types</p>
              <p className="text-2xl font-bold">{uniqueTypes}</p>
              <p className="text-xs text-default-400 mt-1">Categories</p>
            </div>
            <div className="p-3 bg-warning-500/20 rounded-full">
              <BarChart3 className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-default-500 font-medium">
                Recent (24h)
              </p>
              <p className="text-2xl font-bold">{recentRecords}</p>
              <p className="text-xs text-default-400 mt-1">New records</p>
            </div>
            <div className="p-3 bg-success-500/20 rounded-full">
              <Calendar className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

const DataTypeChart = ({ data }) => {
  const chartData =
    data?.reduce((acc, item) => {
      const type = item.data_type;
      const existing = acc.find((d) => d.name === type);

      if (existing) {
        existing.value += 1;
        existing.amount += parseFloat(item.normalized_data?.amount) || 0;
      } else {
        acc.push({
          name: type,
          value: 1,
          amount: parseFloat(item.normalized_data?.amount) || 0,
        });
      }

      return acc;
    }, []) || [];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Data Distribution</h3>
      </CardHeader>
      <CardBody>
        <div className="h-80">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={chartData}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} records`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
};

const TimeSeriesChart = ({ data, type = "area" }) => {
  const chartData =
    data?.reduce((acc, item) => {
      const date = new Date(item.created_at).toISOString().split("T")[0];
      const existing = acc.find((d) => d.date === date);
      const amount = parseFloat(item.normalized_data?.amount) || 0;

      if (existing) {
        existing.amount += amount;
        existing.count += 1;
      } else {
        acc.push({ date, amount, count: 1 });
      }

      return acc;
    }, []) || [];

  // Sort by date
  chartData.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  const ChartComponent = type === "line" ? LineChart : AreaChart;
  const DataComponent = type === "line" ? Line : Area;

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Activity Over Time</h3>
      </CardHeader>
      <CardBody>
        <div className="h-80">
          <ResponsiveContainer height="100%" width="100%">
            <ChartComponent data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  name === "amount" ? `$${value.toLocaleString()}` : value,
                  name === "amount" ? "Total Value" : "Records Count",
                ]}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <DataComponent
                dataKey="amount"
                fill="#8B5CF6"
                fillOpacity={0.6}
                stroke="#8B5CF6"
                type="monotone"
              />
              <DataComponent
                dataKey="count"
                fill="#06B6D4"
                fillOpacity={0.6}
                stroke="#06B6D4"
                type="monotone"
              />
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
};

const DataSourceAnalysis = ({ data }) => {
  const sourceData =
    data?.reduce((acc, item) => {
      // You would need to join with user_extensions to get actual source names
      const source = item.user_extension_id; // This would be the source name in real data
      const existing = acc.find((d) => d.source === source);

      if (existing) {
        existing.records += 1;
        existing.value += parseFloat(item.normalized_data?.amount) || 0;
      } else {
        acc.push({
          source: `Source ${source.slice(-4)}`, // Simplified for demo
          records: 1,
          value: parseFloat(item.normalized_data?.amount) || 0,
          lastUpdate: item.created_at,
        });
      }

      return acc;
    }, []) || [];

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Data Sources Performance</h3>
      </CardHeader>
      <CardBody>
        <div className="h-80">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={sourceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="records" fill="#8B5CF6" name="Records" />
              <Bar dataKey="value" fill="#06B6D4" name="Value ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
};

export default function DataPage() {
  const { profile } = useAuth();
  const { addNotification } = useUIStore();

  const [selectedDataType, setSelectedDataType] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  });
  const [chartType, setChartType] = useState("area");

  // Fetch aggregated data
  const {
    data: aggregatedData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["aggregated-data", selectedDataType, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "1000",
        offset: "0",
      });

      if (selectedDataType !== "all") {
        params.append("type", selectedDataType);
      }

      const response = await fetch(`/api/data/aggregate?${params}`);

      if (!response.ok) throw new Error("Failed to fetch data");
      const result = await response.json();

      return result.data;
    },
    enabled: !!profile,
  });

  // Get unique data types for filter
  const dataTypes = [
    ...new Set(aggregatedData?.map((item) => item.data_type) || []),
  ];

  const handleExport = async (format: "csv" | "json") => {
    try {
      const response = await fetch("/api/data/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format,
          dataType: selectedDataType,
          dateRange,
        }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `data-export-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addNotification({
        type: "success",
        title: "Export Complete",
        message: `Data exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Export Failed",
        message: error.message,
      });
    }
  };

  const handleSyncAll = async () => {
    try {
      const response = await fetch("/api/extensions/sync-all", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Sync failed");

      const result = await response.json();

      addNotification({
        type: "success",
        title: "Sync Started",
        message: `Syncing ${result.synced} extensions`,
      });

      // Refetch data after a delay
      setTimeout(() => refetch(), 5000);
    } catch (error) {
      addNotification({
        type: "error",
        title: "Sync Failed",
        message: error.message,
      });
    }
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-danger-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Failed to Load Data</h2>
        <p className="text-default-600 mb-4">{error.message}</p>
        <Button color="primary" onPress={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Data Analytics
          </h1>
          <p className="text-default-500 mt-1">
            Analyze your aggregated data and insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            startContent={<RefreshCw className="w-4 h-4" />}
            variant="flat"
            onPress={handleSyncAll}
          >
            Sync All
          </Button>
          <Button
            color="primary"
            startContent={<Download className="w-4 h-4" />}
            onPress={() => handleExport("csv")}
          >
            Export Data
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              className="sm:max-w-xs"
              placeholder="All Data Types"
              selectedKeys={[selectedDataType]}
              variant="bordered"
              onSelectionChange={(keys) =>
                setSelectedDataType(Array.from(keys)[0] as string)
              }
            >
              <SelectItem key="all">All Data Types</SelectItem>
              {dataTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </Select>

            <Select
              className="sm:max-w-xs"
              placeholder="Chart Type"
              selectedKeys={[chartType]}
              variant="bordered"
              onSelectionChange={(keys) =>
                setChartType(Array.from(keys)[0] as string)
              }
            >
              <SelectItem key="area">Area Chart</SelectItem>
              <SelectItem key="line">Line Chart</SelectItem>
              <SelectItem key="bar">Bar Chart</SelectItem>
            </Select>

            <div className="flex items-center gap-2">
              <span className="text-sm text-default-600">Last 30 days</span>
              <Chip color="primary" size="sm" variant="flat">
                {aggregatedData?.length || 0} records
              </Chip>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Metrics */}
      <DataMetrics data={aggregatedData} isLoading={isLoading} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeSeriesChart data={aggregatedData} type={chartType} />
        <DataTypeChart data={aggregatedData} />
      </div>

      <DataSourceAnalysis data={aggregatedData} />

      {/* Data Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-lg font-semibold">Recent Data</h3>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                startContent={<Download className="w-3 h-3" />}
                variant="flat"
                onPress={() => handleExport("json")}
              >
                Export JSON
              </Button>
              <Button
                size="sm"
                startContent={<Filter className="w-3 h-3" />}
                variant="flat"
              >
                More Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-default-50 rounded-lg animate-pulse"
                >
                  <div className="w-12 h-12 bg-default-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-4 bg-default-200 rounded" />
                    <div className="w-48 h-3 bg-default-200 rounded" />
                  </div>
                  <div className="w-20 h-4 bg-default-200 rounded" />
                </div>
              ))}
            </div>
          ) : aggregatedData?.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-default-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-default-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Data Found</h3>
              <p className="text-default-600 mb-4">
                {selectedDataType === "all"
                  ? "Connect your data sources to start aggregating data"
                  : `No ${selectedDataType} data available`}
              </p>
              <Button
                as="a"
                color="primary"
                href="/extensions"
                startContent={<Wallet className="w-4 h-4" />}
              >
                Connect Data Sources
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-auto">
              {aggregatedData?.slice(0, 50).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-default-50 rounded-lg hover:bg-default-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {item.data_type.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium capitalize">
                        {item.data_type}
                      </span>
                      <Chip color="primary" size="sm" variant="flat">
                        {item.normalized_data?.type || "Unknown"}
                      </Chip>
                    </div>
                    <p className="text-sm text-default-600">
                      {item.normalized_data?.description || "No description"}
                    </p>
                    <p className="text-xs text-default-500">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {item.normalized_data?.amount
                        ? `${parseFloat(item.normalized_data.amount).toLocaleString()}`
                        : "N/A"}
                    </p>
                    <p className="text-xs text-default-500">
                      {item.normalized_data?.currency || "USD"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
