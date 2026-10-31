export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      app_errors: {
        Row: {
          category: string
          created_at: string
          fingerprint: string
          id: string
          path: string
          resolved: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          fingerprint: string
          id?: string
          path: string
          resolved?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          fingerprint?: string
          id?: string
          path?: string
          resolved?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_errors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      billing_events: {
        Row: {
          amount_minor: number | null
          created_at: string
          currency: string | null
          environment: string
          id: string
          kind: string
          occurred_at: string
          provider_event_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_minor?: number | null
          created_at?: string
          currency?: string | null
          environment: string
          id?: string
          kind: string
          occurred_at: string
          provider_event_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_minor?: number | null
          created_at?: string
          currency?: string | null
          environment?: string
          id?: string
          kind?: string
          occurred_at?: string
          provider_event_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      billing_invoices: {
        Row: {
          amount_paid_minor: number
          amount_refunded_minor: number
          created_at: string
          currency: string
          environment: string
          hosted_invoice_url: string | null
          id: string
          invoice_pdf_url: string | null
          number: string | null
          paid_at: string | null
          provider: string
          provider_invoice_id: string
          provider_payment_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid_minor?: number
          amount_refunded_minor?: number
          created_at?: string
          currency: string
          environment: string
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf_url?: string | null
          number?: string | null
          paid_at?: string | null
          provider?: string
          provider_invoice_id: string
          provider_payment_id?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid_minor?: number
          amount_refunded_minor?: number
          created_at?: string
          currency?: string
          environment?: string
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf_url?: string | null
          number?: string | null
          paid_at?: string | null
          provider?: string
          provider_invoice_id?: string
          provider_payment_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      daily_platform_summaries: {
        Row: {
          accounts_total: number
          active_subscriptions: number | null
          canceled_subscriptions: number | null
          created_at: string
          day: string
          login_source_ready: boolean
          new_accounts: number
          new_subscriptions: number | null
          payment_source_ready: boolean
          refunds_by_currency: Json | null
          revenue_by_currency: Json | null
          successful_logins: number | null
          unique_logins: number | null
          updated_at: string
        }
        Insert: {
          accounts_total: number
          active_subscriptions?: number | null
          canceled_subscriptions?: number | null
          created_at?: string
          day: string
          login_source_ready?: boolean
          new_accounts: number
          new_subscriptions?: number | null
          payment_source_ready?: boolean
          refunds_by_currency?: Json | null
          revenue_by_currency?: Json | null
          successful_logins?: number | null
          unique_logins?: number | null
          updated_at?: string
        }
        Update: {
          accounts_total?: number
          active_subscriptions?: number | null
          canceled_subscriptions?: number | null
          created_at?: string
          day?: string
          login_source_ready?: boolean
          new_accounts?: number
          new_subscriptions?: number | null
          payment_source_ready?: boolean
          refunds_by_currency?: Json | null
          revenue_by_currency?: Json | null
          successful_logins?: number | null
          unique_logins?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      dev_tasks: {
        Row: {
          created_at: string
          id: string
          payload: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          updated_at?: string
        }
        Relationships: []
      }
      museums: {
        Row: {
          category: string
          cover: string
          created_at: string
          description: string
          features: Json
          id: string
          is_public: boolean
          owner_id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          cover?: string
          created_at?: string
          description?: string
          features?: Json
          id?: string
          is_public?: boolean
          owner_id: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          cover?: string
          created_at?: string
          description?: string
          features?: Json
          id?: string
          is_public?: boolean
          owner_id?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "museums_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json
          id: string
          kind: string
          read_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          kind: string
          read_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          kind?: string
          read_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      objects: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean
          museum_id: string
          payload: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean
          museum_id: string
          payload: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean
          museum_id?: string
          payload?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "objects_museum_id_fkey"
            columns: ["museum_id"]
            isOneToOne: false
            referencedRelation: "museums"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_interests: {
        Row: {
          created_at: string
          plan: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          plan: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          plan?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string
          bio: string
          country: string | null
          created_at: string
          id: string
          joined: string
          location: string
          name: string
          preferences: Json
          updated_at: string
          user_id: string | null
          username: string
        }
        Insert: {
          avatar?: string
          bio?: string
          country?: string | null
          created_at?: string
          id?: string
          joined?: string
          location?: string
          name: string
          preferences?: Json
          updated_at?: string
          user_id?: string | null
          username: string
        }
        Update: {
          avatar?: string
          bio?: string
          country?: string | null
          created_at?: string
          id?: string
          joined?: string
          location?: string
          name?: string
          preferences?: Json
          updated_at?: string
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      refund_requests: {
        Row: {
          created_at: string
          id: string
          invoice_id: string
          reason: string
          review_note: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invoice_id: string
          reason: string
          review_note?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invoice_id?: string
          reason?: string
          review_note?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "billing_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "refund_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          currency: string
          monthly_amount_minor: number
          plan: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          monthly_amount_minor?: number
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          monthly_amount_minor?: number
          plan?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_platform_metrics: { Args: never; Returns: Json }
      capture_daily_platform_summary: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      report_app_error: {
        Args: {
          error_category: string
          error_fingerprint: string
          error_path: string
          reporter: string
        }
        Returns: boolean
      }
      request_invoice_refund: {
        Args: { actor: string; explanation: string; invoice: string }
        Returns: string
      }
      review_invoice_refund: {
        Args: { actor: string; decision: string; note: string; request: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
