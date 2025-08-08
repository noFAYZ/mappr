import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  configuration: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  items?: PortfolioItem[];
  performance?: PortfolioPerformance;
}

export interface PortfolioItem {
  id: string;
  portfolioId: string;
  userExtensionId: string;
  itemType: string; // 'wallet', 'account', 'store', etc.
  itemIdentifier: string; // wallet address, account ID, etc.
  itemName?: string;
  metadata: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userExtension?: any; // Populated user extension data
}

export interface PortfolioPerformance {
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
  dayChange: number;
  dayChangePercent: number;
  weekChange: number;
  weekChangePercent: number;
  monthChange: number;
  monthChangePercent: number;
  allocation: Array<{
    category: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  topPerformers: Array<{
    name: string;
    value: number;
    change: number;
    changePercent: number;
  }>;
}

interface PortfolioState {
  portfolios: Portfolio[];
  selectedPortfolio: Portfolio | null;
  portfolioItems: Record<string, PortfolioItem[]>; // portfolioId -> items
  portfolioPerformance: Record<string, PortfolioPerformance>; // portfolioId -> performance
  isLoading: boolean;
  error: string | null;

  // Actions
  setPortfolios: (portfolios: Portfolio[]) => void;
  setSelectedPortfolio: (portfolio: Portfolio | null) => void;
  setPortfolioItems: (portfolioId: string, items: PortfolioItem[]) => void;
  setPortfolioPerformance: (
    portfolioId: string,
    performance: PortfolioPerformance,
  ) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Portfolio operations
  createPortfolio: (name: string, description?: string) => Promise<Portfolio>;
  updatePortfolio: (
    portfolioId: string,
    updates: Partial<Portfolio>,
  ) => Promise<void>;
  deletePortfolio: (portfolioId: string) => Promise<void>;
  duplicatePortfolio: (
    portfolioId: string,
    newName: string,
  ) => Promise<Portfolio>;

  // Portfolio item operations
  addPortfolioItem: (
    portfolioId: string,
    item: Omit<PortfolioItem, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  removePortfolioItem: (portfolioId: string, itemId: string) => Promise<void>;
  updatePortfolioItem: (
    portfolioId: string,
    itemId: string,
    updates: Partial<PortfolioItem>,
  ) => Promise<void>;

  // Computed getters
  getDefaultPortfolio: () => Portfolio | null;
  getPortfolioById: (id: string) => Portfolio | undefined;
  getTotalPortfolioValue: () => number;
  getPortfolioStats: () => {
    totalPortfolios: number;
    totalValue: number;
    totalItems: number;
    bestPerformer: Portfolio | null;
  };
}

export const usePortfolioStore = create<PortfolioState>()(
  devtools(
    (set, get) => ({
      portfolios: [],
      selectedPortfolio: null,
      portfolioItems: {},
      portfolioPerformance: {},
      isLoading: false,
      error: null,

      setPortfolios: (portfolios) => set({ portfolios }),
      setSelectedPortfolio: (selectedPortfolio) => set({ selectedPortfolio }),
      setPortfolioItems: (portfolioId, items) =>
        set((state) => ({
          portfolioItems: { ...state.portfolioItems, [portfolioId]: items },
        })),
      setPortfolioPerformance: (portfolioId, performance) =>
        set((state) => ({
          portfolioPerformance: {
            ...state.portfolioPerformance,
            [portfolioId]: performance,
          },
        })),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      createPortfolio: async (name: string, description?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch("/api/portfolios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, description }),
          });

          if (!response.ok) {
            const errorData = await response.json();

            throw new Error(errorData.message || "Failed to create portfolio");
          }

          const result = await response.json();
          const portfolio = result.data;

          set((state) => ({
            portfolios: [...state.portfolios, portfolio],
            isLoading: false,
          }));

          return portfolio;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      updatePortfolio: async (
        portfolioId: string,
        updates: Partial<Portfolio>,
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/portfolios/${portfolioId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });

          if (!response.ok) {
            const errorData = await response.json();

            throw new Error(errorData.message || "Failed to update portfolio");
          }

          const result = await response.json();
          const updatedPortfolio = result.data;

          set((state) => ({
            portfolios: state.portfolios.map((p) =>
              p.id === portfolioId ? updatedPortfolio : p,
            ),
            selectedPortfolio:
              state.selectedPortfolio?.id === portfolioId
                ? updatedPortfolio
                : state.selectedPortfolio,
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      deletePortfolio: async (portfolioId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/portfolios/${portfolioId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const errorData = await response.json();

            throw new Error(errorData.message || "Failed to delete portfolio");
          }

          set((state) => ({
            portfolios: state.portfolios.filter((p) => p.id !== portfolioId),
            portfolioItems: Object.fromEntries(
              Object.entries(state.portfolioItems).filter(
                ([id]) => id !== portfolioId,
              ),
            ),
            portfolioPerformance: Object.fromEntries(
              Object.entries(state.portfolioPerformance).filter(
                ([id]) => id !== portfolioId,
              ),
            ),
            selectedPortfolio:
              state.selectedPortfolio?.id === portfolioId
                ? null
                : state.selectedPortfolio,
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      duplicatePortfolio: async (portfolioId: string, newName: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `/api/portfolios/${portfolioId}/duplicate`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: newName }),
            },
          );

          if (!response.ok) {
            const errorData = await response.json();

            throw new Error(
              errorData.message || "Failed to duplicate portfolio",
            );
          }

          const result = await response.json();
          const newPortfolio = result.data;

          set((state) => ({
            portfolios: [...state.portfolios, newPortfolio],
            isLoading: false,
          }));

          return newPortfolio;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      addPortfolioItem: async (
        portfolioId: string,
        item: Omit<PortfolioItem, "id" | "createdAt" | "updatedAt">,
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/portfolios/${portfolioId}/items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });

          if (!response.ok) {
            const errorData = await response.json();

            throw new Error(
              errorData.message || "Failed to add portfolio item",
            );
          }

          const result = await response.json();
          const newItem = result.data;

          set((state) => ({
            portfolioItems: {
              ...state.portfolioItems,
              [portfolioId]: [
                ...(state.portfolioItems[portfolioId] || []),
                newItem,
              ],
            },
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      removePortfolioItem: async (portfolioId: string, itemId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `/api/portfolios/${portfolioId}/items/${itemId}`,
            {
              method: "DELETE",
            },
          );

          if (!response.ok) {
            const errorData = await response.json();

            throw new Error(
              errorData.message || "Failed to remove portfolio item",
            );
          }

          set((state) => ({
            portfolioItems: {
              ...state.portfolioItems,
              [portfolioId]: (state.portfolioItems[portfolioId] || []).filter(
                (item) => item.id !== itemId,
              ),
            },
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      updatePortfolioItem: async (
        portfolioId: string,
        itemId: string,
        updates: Partial<PortfolioItem>,
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `/api/portfolios/${portfolioId}/items/${itemId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(updates),
            },
          );

          if (!response.ok) {
            const errorData = await response.json();

            throw new Error(
              errorData.message || "Failed to update portfolio item",
            );
          }

          const result = await response.json();
          const updatedItem = result.data;

          set((state) => ({
            portfolioItems: {
              ...state.portfolioItems,
              [portfolioId]: (state.portfolioItems[portfolioId] || []).map(
                (item) => (item.id === itemId ? updatedItem : item),
              ),
            },
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      // Computed getters
      getDefaultPortfolio: () => {
        return get().portfolios.find((p) => p.isDefault) || null;
      },

      getPortfolioById: (id: string) => {
        return get().portfolios.find((p) => p.id === id);
      },

      getTotalPortfolioValue: () => {
        const { portfolioPerformance } = get();

        return Object.values(portfolioPerformance).reduce(
          (total, perf) => total + perf.totalValue,
          0,
        );
      },

      getPortfolioStats: () => {
        const { portfolios, portfolioItems, portfolioPerformance } = get();

        const totalItems = Object.values(portfolioItems).reduce(
          (total, items) => total + items.length,
          0,
        );
        const totalValue = Object.values(portfolioPerformance).reduce(
          (total, perf) => total + perf.totalValue,
          0,
        );

        const bestPerformer = portfolios.reduce(
          (best, portfolio) => {
            const perf = portfolioPerformance[portfolio.id];

            if (!perf) return best;

            const bestPerf = best ? portfolioPerformance[best.id] : null;

            if (
              !bestPerf ||
              perf.totalChangePercent > bestPerf.totalChangePercent
            ) {
              return portfolio;
            }

            return best;
          },
          null as Portfolio | null,
        );

        return {
          totalPortfolios: portfolios.length,
          totalValue,
          totalItems,
          bestPerformer,
        };
      },
    }),
    { name: "portfolio-store" },
  ),
);
