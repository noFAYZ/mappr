import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timestamp: number;
  read?: boolean;
  actionLabel?: string;
  actionUrl?: string;
}

interface UIState {
  // Theme and appearance
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  compactMode: boolean;
  
  // Notifications
  notifications: Notification[];
  
  // Modals and dialogs
  activeModal: string | null;
  modalData: Record<string, any>;
  
  // Loading states
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;
  
  // Search and filters
  globalSearchQuery: string;
  globalSearchOpen: boolean;
  
  // Actions
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  
  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  clearReadNotifications: () => void;
  
  // Modal actions
  openModal: (modalId: string, data?: Record<string, any>) => void;
  closeModal: () => void;
  setModalData: (data: Record<string, any>) => void;
  
  // Loading actions
  setGlobalLoading: (loading: boolean) => void;
  setLoadingState: (key: string, loading: boolean) => void;
  
  // Search actions
  setGlobalSearchQuery: (query: string) => void;
  setGlobalSearchOpen: (open: boolean) => void;
  
  // Computed getters
  getUnreadNotifications: () => Notification[];
  getLoadingState: (key: string) => boolean;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        theme: 'system',
        sidebarCollapsed: false,
        compactMode: false,
        notifications: [],
        activeModal: null,
        modalData: {},
        globalLoading: false,
        loadingStates: {},
        globalSearchQuery: '',
        globalSearchOpen: false,

        // Theme and appearance actions
        setTheme: (theme) => set({ theme }),
        setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
        setCompactMode: (compactMode) => set({ compactMode }),
        
        // Notification actions
        addNotification: (notification) => set(state => ({
          notifications: [
            {
              ...notification,
              id: Math.random().toString(36).substr(2, 9),
              timestamp: Date.now(),
              read: false,
            },
            ...state.notifications
          ].slice(0, 50) // Keep only last 50 notifications
        })),
        
        removeNotification: (id) => set(state => ({
          notifications: state.notifications.filter(n => n.id !== id)
        })),
        
        markNotificationRead: (id) => set(state => ({
          notifications: state.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
          )
        })),
        
        clearNotifications: () => set({ notifications: [] }),
        
        clearReadNotifications: () => set(state => ({
          notifications: state.notifications.filter(n => !n.read)
        })),
        
        // Modal actions
        openModal: (modalId, data = {}) => set({ 
          activeModal: modalId, 
          modalData: data 
        }),
        
        closeModal: () => set({ 
          activeModal: null, 
          modalData: {} 
        }),
        
        setModalData: (data) => set(state => ({ 
          modalData: { ...state.modalData, ...data } 
        })),
        
        // Loading actions
        setGlobalLoading: (globalLoading) => set({ globalLoading }),
        
        setLoadingState: (key, loading) => set(state => ({
          loadingStates: {
            ...state.loadingStates,
            [key]: loading
          }
        })),
        
        // Search actions
        setGlobalSearchQuery: (globalSearchQuery) => set({ globalSearchQuery }),
        setGlobalSearchOpen: (globalSearchOpen) => set({ globalSearchOpen }),
        
        // Computed getters
        getUnreadNotifications: () => {
          return get().notifications.filter(n => !n.read);
        },
        
        getLoadingState: (key: string) => {
          return get().loadingStates[key] || false;
        },
      }),
      { 
        name: 'ui-store',
        partialize: (state) => ({ 
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          compactMode: state.compactMode,
        })
      }
    ),
    { name: 'ui-store' }
  )
);