import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Extension {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: 'crypto' | 'banking' | 'ecommerce' | 'accounting' | 'file' | 'other';
  provider: string;
  logoUrl?: string;
  apiConfig: Record<string, any>;
  requiredFields: string[];
  supportedDataTypes: string[];
  tierRestrictions: Record<string, boolean>;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  rating?: number;
  connections?: number;
}

export interface UserExtension {
  id: string;
  userId: string;
  extensionId: string;
  connectionName: string;
  credentials: Record<string, any>; // Encrypted
  configuration: Record<string, any>;
  isEnabled: boolean;
  lastSyncAt?: string;
  syncStatus: 'pending' | 'syncing' | 'success' | 'error';
  syncError?: string;
  syncMetadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  extension?: Extension; // Populated extension data
}

interface ExtensionState {
  extensions: Extension[];
  userExtensions: UserExtension[];
  selectedExtension: Extension | null;
  isLoading: boolean;
  error: string | null;
  
  // Filters and search
  searchQuery: string;
  selectedCategory: string;
  showConnectedOnly: boolean;
  
  // Actions
  setExtensions: (extensions: Extension[]) => void;
  setUserExtensions: (userExtensions: UserExtension[]) => void;
  setSelectedExtension: (extension: Extension | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setShowConnectedOnly: (show: boolean) => void;
  
  // Extension operations
  connectExtension: (extensionId: string, credentials: Record<string, any>, connectionName?: string) => Promise<void>;
  disconnectExtension: (userExtensionId: string) => Promise<void>;
  syncExtension: (userExtensionId: string) => Promise<void>;
  updateExtensionConfig: (userExtensionId: string, config: Record<string, any>) => Promise<void>;
  
  // Computed getters
  getConnectedExtensions: () => UserExtension[];
  getAvailableExtensions: () => Extension[];
  getFilteredExtensions: () => Extension[];
  getExtensionBySlug: (slug: string) => Extension | undefined;
}

export const useExtensionStore = create<ExtensionState>()(
  devtools(
    (set, get) => ({
      extensions: [],
      userExtensions: [],
      selectedExtension: null,
      isLoading: false,
      error: null,
      searchQuery: '',
      selectedCategory: 'all',
      showConnectedOnly: false,

      setExtensions: (extensions) => set({ extensions }),
      setUserExtensions: (userExtensions) => set({ userExtensions }),
      setSelectedExtension: (selectedExtension) => set({ selectedExtension }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setShowConnectedOnly: (showConnectedOnly) => set({ showConnectedOnly }),

      connectExtension: async (extensionId: string, credentials: Record<string, any>, connectionName?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/extensions/connect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              extensionId, 
              credentials,
              connectionName: connectionName || 'Default Connection'
            })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Connection failed');
          }
          
          const userExtension = await response.json();
          set(state => ({
            userExtensions: [...state.userExtensions, userExtension.data],
            isLoading: false
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      disconnectExtension: async (userExtensionId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/extensions/${userExtensionId}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Disconnection failed');
          }
          
          set(state => ({
            userExtensions: state.userExtensions.filter(ext => ext.id !== userExtensionId),
            isLoading: false
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      syncExtension: async (userExtensionId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/extensions/${userExtensionId}/sync`, {
            method: 'POST',
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Sync failed');
          }
          
          set(state => ({
            userExtensions: state.userExtensions.map(ext => 
              ext.id === userExtensionId 
                ? { ...ext, syncStatus: 'syncing' as const, lastSyncAt: new Date().toISOString() }
                : ext
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      updateExtensionConfig: async (userExtensionId: string, config: Record<string, any>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`/api/extensions/${userExtensionId}/config`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ configuration: config })
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Update failed');
          }
          
          const updatedExtension = await response.json();
          set(state => ({
            userExtensions: state.userExtensions.map(ext => 
              ext.id === userExtensionId ? updatedExtension.data : ext
            ),
            isLoading: false
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },

      // Computed getters
      getConnectedExtensions: () => {
        return get().userExtensions.filter(ext => ext.isEnabled);
      },

      getAvailableExtensions: () => {
        const { extensions, userExtensions } = get();
        const connectedExtensionIds = new Set(userExtensions.map(ue => ue.extensionId));
        return extensions.filter(ext => !connectedExtensionIds.has(ext.id));
      },

      getFilteredExtensions: () => {
        const { extensions, searchQuery, selectedCategory, showConnectedOnly, userExtensions } = get();
        const connectedExtensionIds = new Set(userExtensions.map(ue => ue.extensionId));
        
        return extensions.filter(ext => {
          // Search filter
          const matchesSearch = !searchQuery || 
            ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ext.description.toLowerCase().includes(searchQuery.toLowerCase());

          // Category filter
          const matchesCategory = selectedCategory === 'all' || ext.category === selectedCategory;

          // Connected filter
          const matchesConnected = !showConnectedOnly || connectedExtensionIds.has(ext.id);

          return matchesSearch && matchesCategory && matchesConnected;
        });
      },

      getExtensionBySlug: (slug: string) => {
        return get().extensions.find(ext => ext.slug === slug);
      },
    }),
    { name: 'extension-store' }
  )
);