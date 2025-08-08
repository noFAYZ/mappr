"use client";

import React, { createContext, useContext, useReducer } from "react";

interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  formData: Record<string, any>;
  isLoading: boolean;
}

type OnboardingAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "NEXT_STEP" }
  | { type: "PREVIOUS_STEP" }
  | { type: "COMPLETE_STEP"; payload: number }
  | { type: "UPDATE_FORM_DATA"; payload: Record<string, any> }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" };

const initialState: OnboardingState = {
  currentStep: 1,
  totalSteps: 4,
  completedSteps: new Set(),
  formData: {},
  isLoading: false,
};

function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction,
): OnboardingState {
  switch (action.type) {
    case "SET_STEP":
      return {
        ...state,
        currentStep: Math.max(1, Math.min(action.payload, state.totalSteps)),
      };
    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, state.totalSteps),
      };
    case "PREVIOUS_STEP":
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
      };
    case "COMPLETE_STEP":
      return {
        ...state,
        completedSteps: new Set([...state.completedSteps, action.payload]),
      };
    case "UPDATE_FORM_DATA":
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface OnboardingContextType extends OnboardingState {
  setStep: (step: number) => void;
  nextStep: () => void;
  previousStep: () => void;
  completeStep: (step: number) => void;
  updateFormData: (data: Record<string, any>) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
  canProceed: boolean;
  progress: number;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined,
);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  const contextValue: OnboardingContextType = {
    ...state,
    setStep: (step) => dispatch({ type: "SET_STEP", payload: step }),
    nextStep: () => dispatch({ type: "NEXT_STEP" }),
    previousStep: () => dispatch({ type: "PREVIOUS_STEP" }),
    completeStep: (step) => dispatch({ type: "COMPLETE_STEP", payload: step }),
    updateFormData: (data) =>
      dispatch({ type: "UPDATE_FORM_DATA", payload: data }),
    setLoading: (loading) =>
      dispatch({ type: "SET_LOADING", payload: loading }),
    reset: () => dispatch({ type: "RESET" }),
    canProceed: state.completedSteps.has(state.currentStep),
    progress: (state.completedSteps.size / state.totalSteps) * 100,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }

  return context;
}
