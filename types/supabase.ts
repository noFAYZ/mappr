export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_contexts: {
        Row: {
          context_data: Json | null
          context_type: string | null
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          context_data?: Json | null
          context_type?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          context_data?: Json | null
          context_type?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_contexts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          context_id: string | null
          created_at: string | null
          id: string
          messages: Json | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          context_id?: string | null
          created_at?: string | null
          id?: string
          messages?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          context_id?: string | null
          created_at?: string | null
          id?: string
          messages?: Json | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_context_id_fkey"
            columns: ["context_id"]
            isOneToOne: false
            referencedRelation: "ai_contexts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      extensions: {
        Row: {
          api_config: Json
          category: Database["public"]["Enums"]["extension_category"]
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          logo_url: string | null
          name: string
          provider: string
          required_fields: Json | null
          slug: string
          sort_order: number | null
          supported_data_types: Json | null
          tier_restrictions: Json | null
          updated_at: string | null
        }
        Insert: {
          api_config?: Json
          category: Database["public"]["Enums"]["extension_category"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          name: string
          provider: string
          required_fields?: Json | null
          slug: string
          sort_order?: number | null
          supported_data_types?: Json | null
          tier_restrictions?: Json | null
          updated_at?: string | null
        }
        Update: {
          api_config?: Json
          category?: Database["public"]["Enums"]["extension_category"]
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          logo_url?: string | null
          name?: string
          provider?: string
          required_fields?: Json | null
          slug?: string
          sort_order?: number | null
          supported_data_types?: Json | null
          tier_restrictions?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extensions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          name: string
          settings: Json | null
          slug: string
          tier: Database["public"]["Enums"]["tier_type"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          settings?: Json | null
          slug: string
          tier?: Database["public"]["Enums"]["tier_type"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          tier?: Database["public"]["Enums"]["tier_type"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      portfolio_items: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          item_identifier: string
          item_name: string | null
          item_type: string
          metadata: Json | null
          portfolio_id: string | null
          updated_at: string | null
          user_extension_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          item_identifier: string
          item_name?: string | null
          item_type: string
          metadata?: Json | null
          portfolio_id?: string | null
          updated_at?: string | null
          user_extension_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          item_identifier?: string
          item_name?: string | null
          item_type?: string
          metadata?: Json | null
          portfolio_id?: string | null
          updated_at?: string | null
          user_extension_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_items_user_extension_id_fkey"
            columns: ["user_extension_id"]
            isOneToOne: false
            referencedRelation: "user_extensions"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_snapshots: {
        Row: {
          chains_count: number | null
          created_at: string | null
          day_change: number | null
          day_change_percent: number | null
          defi_value: number | null
          id: string
          nfts_value: number | null
          portfolio_data: Json | null
          positions_count: number | null
          positions_data: Json | null
          snapshot_date: string
          tokens_value: number | null
          total_value: number | null
          wallet_id: string
        }
        Insert: {
          chains_count?: number | null
          created_at?: string | null
          day_change?: number | null
          day_change_percent?: number | null
          defi_value?: number | null
          id?: string
          nfts_value?: number | null
          portfolio_data?: Json | null
          positions_count?: number | null
          positions_data?: Json | null
          snapshot_date?: string
          tokens_value?: number | null
          total_value?: number | null
          wallet_id: string
        }
        Update: {
          chains_count?: number | null
          created_at?: string | null
          day_change?: number | null
          day_change_percent?: number | null
          defi_value?: number | null
          id?: string
          nfts_value?: number | null
          portfolio_data?: Json | null
          positions_count?: number | null
          positions_data?: Json | null
          snapshot_date?: string
          tokens_value?: number | null
          total_value?: number | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_snapshots_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          configuration: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["role_type"] | null
          settings: Json | null
          tier: Database["public"]["Enums"]["tier_type"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["role_type"] | null
          settings?: Json | null
          tier?: Database["public"]["Enums"]["tier_type"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["role_type"] | null
          settings?: Json | null
          tier?: Database["public"]["Enums"]["tier_type"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_extensions: {
        Row: {
          configuration: Json | null
          connection_name: string
          created_at: string | null
          credentials: Json
          extension_id: string | null
          id: string
          is_enabled: boolean | null
          last_sync_at: string | null
          sync_error: string | null
          sync_metadata: Json | null
          sync_status: Database["public"]["Enums"]["sync_status_type"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          configuration?: Json | null
          connection_name: string
          created_at?: string | null
          credentials: Json
          extension_id?: string | null
          id?: string
          is_enabled?: boolean | null
          last_sync_at?: string | null
          sync_error?: string | null
          sync_metadata?: Json | null
          sync_status?: Database["public"]["Enums"]["sync_status_type"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          configuration?: Json | null
          connection_name?: string
          created_at?: string | null
          credentials?: Json
          extension_id?: string | null
          id?: string
          is_enabled?: boolean | null
          last_sync_at?: string | null
          sync_error?: string | null
          sync_metadata?: Json | null
          sync_status?: Database["public"]["Enums"]["sync_status_type"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_extensions_extension_id_fkey"
            columns: ["extension_id"]
            isOneToOne: false
            referencedRelation: "extensions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_extensions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wallets: {
        Row: {
          address: string
          chain_type: string | null
          created_at: string | null
          data_summary: Json | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          last_sync_at: string | null
          metadata: Json | null
          name: string | null
          sync_error: string | null
          sync_metadata: Json | null
          sync_status: string | null
          updated_at: string | null
          user_id: string
          wallet_type: string | null
        }
        Insert: {
          address: string
          chain_type?: string | null
          created_at?: string | null
          data_summary?: Json | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          name?: string | null
          sync_error?: string | null
          sync_metadata?: Json | null
          sync_status?: string | null
          updated_at?: string | null
          user_id: string
          wallet_type?: string | null
        }
        Update: {
          address?: string
          chain_type?: string | null
          created_at?: string | null
          data_summary?: Json | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          name?: string | null
          sync_error?: string | null
          sync_metadata?: Json | null
          sync_status?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      wallet_chart_data: {
        Row: {
          created_at: string | null
          id: string
          period: string
          timestamp: string
          value: number
          wallet_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          period?: string
          timestamp: string
          value?: number
          wallet_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          period?: string
          timestamp?: string
          value?: number
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_chart_data_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_nft_positions: {
        Row: {
          chain_id: string | null
          collection_name: string | null
          contract_address: string | null
          created_at: string | null
          description: string | null
          floor_price: number | null
          id: string
          image_url: string | null
          metadata: Json | null
          name: string
          token_id: string
          updated_at: string | null
          wallet_id: string
        }
        Insert: {
          chain_id?: string | null
          collection_name?: string | null
          contract_address?: string | null
          created_at?: string | null
          description?: string | null
          floor_price?: number | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name: string
          token_id: string
          updated_at?: string | null
          wallet_id: string
        }
        Update: {
          chain_id?: string | null
          collection_name?: string | null
          contract_address?: string | null
          created_at?: string | null
          description?: string | null
          floor_price?: number | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          name?: string
          token_id?: string
          updated_at?: string | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_nft_positions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_portfolio_summary: {
        Row: {
          chains_count: number | null
          created_at: string | null
          day_change: number | null
          day_change_percent: number | null
          id: string
          last_sync_at: string | null
          nft_count: number | null
          positions_count: number | null
          total_value: number
          updated_at: string | null
          wallet_id: string
        }
        Insert: {
          chains_count?: number | null
          created_at?: string | null
          day_change?: number | null
          day_change_percent?: number | null
          id?: string
          last_sync_at?: string | null
          nft_count?: number | null
          positions_count?: number | null
          total_value?: number
          updated_at?: string | null
          wallet_id: string
        }
        Update: {
          chains_count?: number | null
          created_at?: string | null
          day_change?: number | null
          day_change_percent?: number | null
          id?: string
          last_sync_at?: string | null
          nft_count?: number | null
          positions_count?: number | null
          total_value?: number
          updated_at?: string | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_portfolio_summary_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: true
            referencedRelation: "user_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_positions: {
        Row: {
          chain_id: string | null
          change_24h: number | null
          created_at: string | null
          icon_url: string | null
          id: string
          is_verified: boolean | null
          metadata: Json | null
          name: string
          position_type: string | null
          price: number
          protocol_id: string | null
          quantity: number
          symbol: string
          token_address: string | null
          updated_at: string | null
          value: number
          wallet_id: string
        }
        Insert: {
          chain_id?: string | null
          change_24h?: number | null
          created_at?: string | null
          icon_url?: string | null
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          name: string
          position_type?: string | null
          price?: number
          protocol_id?: string | null
          quantity?: number
          symbol: string
          token_address?: string | null
          updated_at?: string | null
          value?: number
          wallet_id: string
        }
        Update: {
          chain_id?: string | null
          change_24h?: number | null
          created_at?: string | null
          icon_url?: string | null
          id?: string
          is_verified?: boolean | null
          metadata?: Json | null
          name?: string
          position_type?: string | null
          price?: number
          protocol_id?: string | null
          quantity?: number
          symbol?: string
          token_address?: string | null
          updated_at?: string | null
          value?: number
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_positions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_sync_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          job_type: string
          max_retries: number | null
          priority: number | null
          retry_count: number | null
          scheduled_for: string | null
          started_at: string | null
          status: string | null
          sync_options: Json | null
          sync_result: Json | null
          updated_at: string | null
          wallet_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          job_type: string
          max_retries?: number | null
          priority?: number | null
          retry_count?: number | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
          sync_options?: Json | null
          sync_result?: Json | null
          updated_at?: string | null
          wallet_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          job_type?: string
          max_retries?: number | null
          priority?: number | null
          retry_count?: number | null
          scheduled_for?: string | null
          started_at?: string | null
          status?: string | null
          sync_options?: Json | null
          sync_result?: Json | null
          updated_at?: string | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_sync_jobs_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          block_number: number | null
          chain_id: string | null
          created_at: string | null
          direction: string | null
          fee: number | null
          from_address: string | null
          gas_price: number | null
          gas_used: number | null
          hash: string
          id: string
          metadata: Json | null
          status: string | null
          timestamp: string | null
          to_address: string | null
          transaction_type: string | null
          value: number | null
          wallet_id: string
        }
        Insert: {
          block_number?: number | null
          chain_id?: string | null
          created_at?: string | null
          direction?: string | null
          fee?: number | null
          from_address?: string | null
          gas_price?: number | null
          gas_used?: number | null
          hash: string
          id?: string
          metadata?: Json | null
          status?: string | null
          timestamp?: string | null
          to_address?: string | null
          transaction_type?: string | null
          value?: number | null
          wallet_id: string
        }
        Update: {
          block_number?: number | null
          chain_id?: string | null
          created_at?: string | null
          direction?: string | null
          fee?: number | null
          from_address?: string | null
          gas_price?: number | null
          gas_used?: number | null
          hash?: string
          id?: string
          metadata?: Json | null
          status?: string | null
          timestamp?: string | null
          to_address?: string | null
          transaction_type?: string | null
          value?: number | null
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      portfolio_summary_cache: {
        Row: {
          active_wallets: number | null
          last_updated: string | null
          total_change: number | null
          total_change_percent: number | null
          total_value: number | null
          user_id: string | null
          wallets_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Functions: {
      cleanup_old_wallet_data: {
        Args: { days_to_keep?: number }
        Returns: number
      }
      create_portfolio_snapshot: {
        Args: { wallet_uuid: string }
        Returns: string
      }
      get_latest_wallet_chunk: {
        Args: { wallet_uuid: string; chunk_type: string }
        Returns: {
          compressed_data: string
          summary: Json
          metadata: Json
        }[]
      }
      get_ohlc_chart_data: {
        Args: { p_wallet_id: string; p_period?: string }
        Returns: {
          chart_timestamp: string
          open_value: number
          high_value: number
          low_value: number
          close_value: number
          avg_value: number
          volume: number
          period_label: string
        }[]
      }
      get_portfolio_summary: {
        Args: { user_id: string }
        Returns: {
          total_value: number
          total_change: number
          total_change_percent: number
          wallets_count: number
          active_wallets: number
        }[]
      }
      get_user_wallets_summary: {
        Args: { user_uuid: string }
        Returns: {
          wallet_id: string
          address: string
          name: string
          chain_type: string
          is_primary: boolean
          last_sync_at: string
          sync_status: string
          summary: Json
        }[]
      }
      migrate_wallet_data_to_optimized: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      refresh_portfolio_summary_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      extension_category:
        | "crypto"
        | "banking"
        | "ecommerce"
        | "accounting"
        | "file"
        | "other"
      role_type: "owner" | "admin" | "member"
      sync_status_type: "pending" | "syncing" | "success" | "error"
      tier_type: "free" | "pro" | "enterprise"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      extension_category: [
        "crypto",
        "banking",
        "ecommerce",
        "accounting",
        "file",
        "other",
      ],
      role_type: ["owner", "admin", "member"],
      sync_status_type: ["pending", "syncing", "success", "error"],
      tier_type: ["free", "pro", "enterprise"],
    },
  },
} as const
