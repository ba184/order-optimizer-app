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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string | null
          date: string
          dsr_submitted: boolean | null
          id: string
          login_location: Json | null
          login_selfie: string | null
          login_time: string | null
          logout_location: Json | null
          logout_selfie: string | null
          logout_time: string | null
          orders_placed: number | null
          status: string | null
          total_distance: number | null
          updated_at: string | null
          user_id: string
          visit_count: number | null
        }
        Insert: {
          created_at?: string | null
          date?: string
          dsr_submitted?: boolean | null
          id?: string
          login_location?: Json | null
          login_selfie?: string | null
          login_time?: string | null
          logout_location?: Json | null
          logout_selfie?: string | null
          logout_time?: string | null
          orders_placed?: number | null
          status?: string | null
          total_distance?: number | null
          updated_at?: string | null
          user_id: string
          visit_count?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          dsr_submitted?: boolean | null
          id?: string
          login_location?: Json | null
          login_selfie?: string | null
          login_time?: string | null
          logout_location?: Json | null
          logout_selfie?: string | null
          logout_time?: string | null
          orders_placed?: number | null
          status?: string | null
          total_distance?: number | null
          updated_at?: string | null
          user_id?: string
          visit_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beat_plans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          id: string
          month: number
          plan_type: string | null
          rejection_reason: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          month: number
          plan_type?: string | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          id?: string
          month?: number
          plan_type?: string | null
          rejection_reason?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "beat_plans_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beat_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beat_routes: {
        Row: {
          area: string | null
          beat_plan_id: string
          created_at: string | null
          day_of_week: number | null
          id: string
          planned_visits: number | null
          retailers: Json | null
          route_date: string | null
          zone: string | null
        }
        Insert: {
          area?: string | null
          beat_plan_id: string
          created_at?: string | null
          day_of_week?: number | null
          id?: string
          planned_visits?: number | null
          retailers?: Json | null
          route_date?: string | null
          zone?: string | null
        }
        Update: {
          area?: string | null
          beat_plan_id?: string
          created_at?: string | null
          day_of_week?: number | null
          id?: string
          planned_visits?: number | null
          retailers?: Json | null
          route_date?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beat_routes_beat_plan_id_fkey"
            columns: ["beat_plan_id"]
            isOneToOne: false
            referencedRelation: "beat_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_sales_reports: {
        Row: {
          area: string | null
          city: string | null
          collection_amount: number | null
          complaints: number | null
          created_at: string | null
          date: string
          distributor_id: string | null
          distributor_name: string | null
          id: string
          market_intelligence: string | null
          new_retailers: number | null
          order_value: number | null
          orders_count: number | null
          productive_calls: number | null
          remarks: string | null
          retailer_id: string | null
          retailer_name: string | null
          status: string | null
          submitted_at: string | null
          total_calls: number | null
          updated_at: string | null
          user_id: string
          visit_type: string | null
          zone: string | null
        }
        Insert: {
          area?: string | null
          city?: string | null
          collection_amount?: number | null
          complaints?: number | null
          created_at?: string | null
          date?: string
          distributor_id?: string | null
          distributor_name?: string | null
          id?: string
          market_intelligence?: string | null
          new_retailers?: number | null
          order_value?: number | null
          orders_count?: number | null
          productive_calls?: number | null
          remarks?: string | null
          retailer_id?: string | null
          retailer_name?: string | null
          status?: string | null
          submitted_at?: string | null
          total_calls?: number | null
          updated_at?: string | null
          user_id: string
          visit_type?: string | null
          zone?: string | null
        }
        Update: {
          area?: string | null
          city?: string | null
          collection_amount?: number | null
          complaints?: number | null
          created_at?: string | null
          date?: string
          distributor_id?: string | null
          distributor_name?: string | null
          id?: string
          market_intelligence?: string | null
          new_retailers?: number | null
          order_value?: number | null
          orders_count?: number | null
          productive_calls?: number | null
          remarks?: string | null
          retailer_id?: string | null
          retailer_name?: string | null
          status?: string | null
          submitted_at?: string | null
          total_calls?: number | null
          updated_at?: string | null
          user_id?: string
          visit_type?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_sales_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      distributors: {
        Row: {
          address: string | null
          city: string | null
          code: string
          created_at: string | null
          credit_limit: number | null
          email: string | null
          firm_name: string
          gstin: string | null
          id: string
          last_order_date: string | null
          outstanding_amount: number | null
          owner_name: string
          phone: string | null
          state: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: string
          created_at?: string | null
          credit_limit?: number | null
          email?: string | null
          firm_name: string
          gstin?: string | null
          id?: string
          last_order_date?: string | null
          outstanding_amount?: number | null
          owner_name: string
          phone?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          created_at?: string | null
          credit_limit?: number | null
          email?: string | null
          firm_name?: string
          gstin?: string | null
          id?: string
          last_order_date?: string | null
          outstanding_amount?: number | null
          owner_name?: string
          phone?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      employee_locations: {
        Row: {
          accuracy: number | null
          address: string | null
          battery_level: number | null
          created_at: string | null
          id: string
          is_moving: boolean | null
          latitude: number
          longitude: number
          recorded_at: string | null
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          address?: string | null
          battery_level?: number | null
          created_at?: string | null
          id?: string
          is_moving?: boolean | null
          latitude: number
          longitude: number
          recorded_at?: string | null
          user_id: string
        }
        Update: {
          accuracy?: number | null
          address?: string | null
          battery_level?: number | null
          created_at?: string | null
          id?: string
          is_moving?: boolean | null
          latitude?: number
          longitude?: number
          recorded_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_locations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          address: string | null
          approval_reason: string | null
          approval_status: string | null
          area: string | null
          assigned_to: string | null
          city: string | null
          created_at: string | null
          created_by: string
          email: string | null
          follow_up_date: string | null
          id: string
          lead_type: string | null
          name: string
          notes: string | null
          phone: string | null
          potential_value: number | null
          shop_name: string | null
          source: string | null
          state: string | null
          status: string | null
          updated_at: string | null
          zone: string | null
        }
        Insert: {
          address?: string | null
          approval_reason?: string | null
          approval_status?: string | null
          area?: string | null
          assigned_to?: string | null
          city?: string | null
          created_at?: string | null
          created_by: string
          email?: string | null
          follow_up_date?: string | null
          id?: string
          lead_type?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          potential_value?: number | null
          shop_name?: string | null
          source?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          zone?: string | null
        }
        Update: {
          address?: string | null
          approval_reason?: string | null
          approval_status?: string | null
          area?: string | null
          assigned_to?: string | null
          city?: string | null
          created_at?: string | null
          created_by?: string
          email?: string | null
          follow_up_date?: string | null
          id?: string
          lead_type?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          potential_value?: number | null
          shop_name?: string | null
          source?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leaves: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          days: number
          end_date: string
          id: string
          leave_type: string
          reason: string
          rejection_reason: string | null
          start_date: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days: number
          end_date: string
          id?: string
          leave_type: string
          reason: string
          rejection_reason?: string | null
          start_date: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days?: number
          end_date?: string
          id?: string
          leave_type?: string
          reason?: string
          rejection_reason?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaves_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          discount: number | null
          free_goods: number | null
          gst_amount: number
          gst_percent: number
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_amount: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          discount?: number | null
          free_goods?: number | null
          gst_amount?: number
          gst_percent?: number
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          total_amount?: number
          unit_price?: number
        }
        Update: {
          created_at?: string | null
          discount?: number | null
          free_goods?: number | null
          gst_amount?: number
          gst_percent?: number
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string
          delivered_at: string | null
          discount: number | null
          dispatched_at: string | null
          distributor_id: string | null
          gst_amount: number | null
          id: string
          items_count: number | null
          notes: string | null
          order_number: string
          order_type: string
          payment_status: string | null
          retailer_id: string | null
          status: string | null
          subtotal: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by: string
          delivered_at?: string | null
          discount?: number | null
          dispatched_at?: string | null
          distributor_id?: string | null
          gst_amount?: number | null
          id?: string
          items_count?: number | null
          notes?: string | null
          order_number: string
          order_type?: string
          payment_status?: string | null
          retailer_id?: string | null
          status?: string | null
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string
          delivered_at?: string | null
          discount?: number | null
          dispatched_at?: string | null
          distributor_id?: string | null
          gst_amount?: number | null
          id?: string
          items_count?: number | null
          notes?: string | null
          order_number?: string
          order_type?: string
          payment_status?: string | null
          retailer_id?: string | null
          status?: string | null
          subtotal?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          can_approve: boolean | null
          can_create: boolean | null
          can_delete: boolean | null
          can_edit: boolean | null
          can_view: boolean | null
          created_at: string | null
          id: string
          module: string
          role_id: string
        }
        Insert: {
          can_approve?: boolean | null
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          module: string
          role_id: string
        }
        Update: {
          can_approve?: boolean | null
          can_create?: boolean | null
          can_delete?: boolean | null
          can_edit?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          module?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          gst: number
          id: string
          mrp: number
          name: string
          ptr: number
          sku: string
          status: string | null
          stock: number
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          gst?: number
          id?: string
          mrp?: number
          name: string
          ptr?: number
          sku: string
          status?: string | null
          stock?: number
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          gst?: number
          id?: string
          mrp?: number
          name?: string
          ptr?: number
          sku?: string
          status?: string | null
          stock?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          region: string | null
          reporting_to: string | null
          status: string | null
          territory: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name: string
          phone?: string | null
          region?: string | null
          reporting_to?: string | null
          status?: string | null
          territory?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          region?: string | null
          reporting_to?: string | null
          status?: string | null
          territory?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_reporting_to_fkey"
            columns: ["reporting_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      retailers: {
        Row: {
          address: string | null
          category: string | null
          city: string | null
          code: string
          created_at: string | null
          distributor_id: string | null
          email: string | null
          id: string
          last_order_value: number | null
          last_visit: string | null
          owner_name: string
          phone: string | null
          shop_name: string
          state: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          city?: string | null
          code: string
          created_at?: string | null
          distributor_id?: string | null
          email?: string | null
          id?: string
          last_order_value?: number | null
          last_visit?: string | null
          owner_name: string
          phone?: string | null
          shop_name: string
          state?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          city?: string | null
          code?: string
          created_at?: string | null
          distributor_id?: string | null
          email?: string | null
          id?: string
          last_order_value?: number | null
          last_visit?: string | null
          owner_name?: string
          phone?: string | null
          shop_name?: string
          state?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retailers_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_system: boolean | null
          level: number
          name: string
          status: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          level: number
          name: string
          status?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean | null
          level?: number
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role_level: { Args: { user_id: string }; Returns: number }
      has_permission: {
        Args: { action: string; module_name: string; user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: { role_code: string; user_id: string }
        Returns: boolean
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "rsm" | "asm" | "sales_executive"
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
  public: {
    Enums: {
      app_role: ["admin", "rsm", "asm", "sales_executive"],
    },
  },
} as const
