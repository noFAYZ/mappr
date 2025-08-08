"use client";

import React, { createContext, useContext, useReducer } from "react";

interface DashboardState {
  selectedPortfolio: string | null;
  viewMode: "grid" | "list";
  filters: Record<string, any>;
  isLoading: boolean;
}

type DashboardAction =
  | { type: "SELECT_PORTFOLIO"; payload: string | null }
  | { type: "SET_VIEW_MODE"; payload: "grid" | "list" }
  | { type: "SET_FILTERS"; payload: Record<string, any> }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" };

const initialState: DashboardState = {
  selectedPortfolio: null,
  viewMode: "grid",
  filters: {},
  isLoading: false,
};

function dashboardReducer(
  state: DashboardState,
  action: DashboardAction,
): DashboardState {
  switch (action.type) {
    case "SELECT_PORTFOLIO":
      return { ...state, selectedPortfolio: action.payload };
    case "SET_VIEW_MODE":
      return { ...state, viewMode: action.payload };
    case "SET_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface DashboardContextType extends DashboardState {
  selectPortfolio: (id: string | null) => void;
  setViewMode: (mode: "grid" | "list") => void;
  setFilters: (filters: Record<string, any>) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const contextValue: DashboardContextType = {
    ...state,
    selectPortfolio: (id) =>
      dispatch({ type: "SELECT_PORTFOLIO", payload: id }),
    setViewMode: (mode) => dispatch({ type: "SET_VIEW_MODE", payload: mode }),
    setFilters: (filters) =>
      dispatch({ type: "SET_FILTERS", payload: filters }),
    setLoading: (loading) =>
      dispatch({ type: "SET_LOADING", payload: loading }),
    reset: () => dispatch({ type: "RESET" }),
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }

  return context;
}
