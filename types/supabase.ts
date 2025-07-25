// types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          tier: 'free' | 'pro' | 'enterprise'
          organization_id: string | null
          role: 'owner' | 'admin' | 'member'
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          tier?: 'free' | 'pro' | 'enterprise'
          organization_id?: string | null
          role?: 'owner' | 'admin' | 'member'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          tier?: 'free' | 'pro' | 'enterprise'
          organization_id?: string | null
          role?: 'owner' | 'admin' | 'member'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          tier: 'free' | 'pro' | 'enterprise'
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          tier?: 'free' | 'pro' | 'enterprise'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          tier?: 'free' | 'pro' | 'enterprise'
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      extensions: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          category: 'crypto' | 'banking' | 'ecommerce' | 'accounting' | 'file' | 'other'
          provider: string
          logo_url: string | null
          api_config: Json
          required_fields: Json
          supported_data_types: Json
          tier_restrictions: Json
          is_active: boolean
          is_featured: boolean
          sort_order: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          category: 'crypto' | 'banking' | 'ecommerce' | 'accounting' | 'file' | 'other'
          provider: string
          logo_url?: string | null
          api_config?: Json
          required_fields?: Json
          supported_data_types?: Json
          tier_restrictions?: Json
          is_active?: boolean
          is_featured?: boolean
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          category?: 'crypto' | 'banking' | 'ecommerce' | 'accounting' | 'file' | 'other'
          provider?: string
          logo_url?: string | null
          api_config?: Json
          required_fields?: Json
          supported_data_types?: Json
          tier_restrictions?: Json
          is_active?: boolean
          is_featured?: boolean
          sort_order?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_extensions: {
        Row: {
          id: string
          user_id: string
          extension_id: string
          connection_name: string
          credentials: Json
          configuration: Json
          is_enabled: boolean
          last_sync_at: string | null
          sync_status: 'pending' | 'syncing' | 'success' | 'error'
          sync_error: string | null
          sync_metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          extension_id: string
          connection_name: string
          credentials: Json
          configuration?: Json
          is_enabled?: boolean
          last_sync_at?: string | null
          sync_status?: 'pending' | 'syncing' | 'success' | 'error'
          sync_error?: string | null
          sync_metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          extension_id?: string
          connection_name?: string
          credentials?: Json
          configuration?: Json
          is_enabled?: boolean
          last_sync_at?: string | null
          sync_status?: 'pending' | 'syncing' | 'success' | 'error'
          sync_error?: string | null
          sync_metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      portfolios: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_default: boolean
          configuration: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_default?: boolean
          configuration?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_default?: boolean
          configuration?: Json
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_items: {
        Row: {
          id: string
          portfolio_id: string
          user_extension_id: string
          item_type: string
          item_identifier: string
          item_name: string | null
          metadata: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          user_extension_id: string
          item_type: string
          item_identifier: string
          item_name?: string | null
          metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          user_extension_id?: string
          item_type?: string
          item_identifier?: string
          item_name?: string | null
          metadata?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      aggregated_data: {
        Row: {
          id: string
          user_extension_id: string
          data_type: string
          raw_data: Json
          normalized_data: Json
          metadata: Json
          sync_batch_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_extension_id: string
          data_type: string
          raw_data: Json
          normalized_data: Json
          metadata?: Json
          sync_batch_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_extension_id?: string
          data_type?: string
          raw_data?: Json
          normalized_data?: Json
          metadata?: Json
          sync_batch_id?: string | null
          created_at?: string
        }
      }
      ai_contexts: {
        Row: {
          id: string
          user_id: string
          context_type: string
          context_data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          context_type?: string
          context_data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          context_type?: string
          context_data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      ai_conversations: {
        Row: {
          id: string
          user_id: string
          context_id: string | null
          title: string | null
          messages: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          context_id?: string | null
          title?: string | null
          messages?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          context_id?: string | null
          title?: string | null
          messages?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
