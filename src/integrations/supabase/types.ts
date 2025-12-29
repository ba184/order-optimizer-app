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
      advanced_schemes: {
        Row: {
          applicability: string | null
          benefit: string | null
          claims_approved: number | null
          claims_generated: number | null
          code: string
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          max_benefit: number | null
          min_value: number | null
          name: string
          start_date: string
          status: string | null
          total_payout: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          applicability?: string | null
          benefit?: string | null
          claims_approved?: number | null
          claims_generated?: number | null
          code: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          max_benefit?: number | null
          min_value?: number | null
          name: string
          start_date: string
          status?: string | null
          total_payout?: number | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          applicability?: string | null
          benefit?: string | null
          claims_approved?: number | null
          claims_generated?: number | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          max_benefit?: number | null
          min_value?: number | null
          name?: string
          start_date?: string
          status?: string | null
          total_payout?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
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
      cities: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          state_id: string
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          state_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          state_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          created_at: string
          currency: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          currency?: string
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          currency?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
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
      distributor_kyc_documents: {
        Row: {
          created_at: string | null
          distributor_id: string
          document_number: string
          document_type: string
          file_url: string | null
          id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          distributor_id: string
          document_number: string
          document_type: string
          file_url?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          distributor_id?: string
          document_number?: string
          document_type?: string
          file_url?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distributor_kyc_documents_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
        ]
      }
      distributor_preorders: {
        Row: {
          created_at: string | null
          distributor_id: string
          expected_delivery: string | null
          id: string
          preorder_value: number | null
          product_id: string | null
          quantity: number
        }
        Insert: {
          created_at?: string | null
          distributor_id: string
          expected_delivery?: string | null
          id?: string
          preorder_value?: number | null
          product_id?: string | null
          quantity?: number
        }
        Update: {
          created_at?: string | null
          distributor_id?: string
          expected_delivery?: string | null
          id?: string
          preorder_value?: number | null
          product_id?: string | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "distributor_preorders_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributor_preorders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      distributor_pricing_tiers: {
        Row: {
          created_at: string | null
          distributor_id: string
          id: string
          margin_percent: number
          max_qty: number
          min_qty: number
        }
        Insert: {
          created_at?: string | null
          distributor_id: string
          id?: string
          margin_percent: number
          max_qty: number
          min_qty: number
        }
        Update: {
          created_at?: string | null
          distributor_id?: string
          id?: string
          margin_percent?: number
          max_qty?: number
          min_qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "distributor_pricing_tiers_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
        ]
      }
      distributor_products: {
        Row: {
          created_at: string | null
          distributor_id: string
          id: string
          margin_percent: number | null
          product_id: string
        }
        Insert: {
          created_at?: string | null
          distributor_id: string
          id?: string
          margin_percent?: number | null
          product_id: string
        }
        Update: {
          created_at?: string | null
          distributor_id?: string
          id?: string
          margin_percent?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "distributor_products_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributor_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      distributor_schemes: {
        Row: {
          created_at: string | null
          distributor_id: string
          id: string
          scheme_id: string
        }
        Insert: {
          created_at?: string | null
          distributor_id: string
          id?: string
          scheme_id: string
        }
        Update: {
          created_at?: string | null
          distributor_id?: string
          id?: string
          scheme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "distributor_schemes_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distributor_schemes_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      distributor_secondary_counters: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          distributor_id: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          distributor_id: string
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          distributor_id?: string
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distributor_secondary_counters_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
        ]
      }
      distributor_warehouses: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          distributor_id: string
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          distributor_id: string
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          distributor_id?: string
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "distributor_warehouses_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
        ]
      }
      distributors: {
        Row: {
          account_number: string | null
          address: string | null
          agreement_end_date: string | null
          agreement_file_url: string | null
          agreement_signed: boolean | null
          agreement_start_date: string | null
          alt_phone: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          bank_name: string | null
          category: string | null
          city: string | null
          code: string
          contact_name: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          email: string | null
          firm_name: string
          gstin: string | null
          id: string
          ifsc_code: string | null
          interested_products: string[] | null
          kyc_status: string | null
          last_order_date: string | null
          minimum_order_value: number | null
          msme_number: string | null
          msme_registered: boolean | null
          msme_type: string | null
          outstanding_amount: number | null
          owner_name: string
          pan_number: string | null
          payment_terms: string | null
          phone: string | null
          pincode: string | null
          registered_address: string | null
          rejection_reason: string | null
          return_policy: string | null
          state: string | null
          status: string | null
          tan_number: string | null
          territory_exclusive: boolean | null
          updated_at: string | null
          zone: string | null
        }
        Insert: {
          account_number?: string | null
          address?: string | null
          agreement_end_date?: string | null
          agreement_file_url?: string | null
          agreement_signed?: boolean | null
          agreement_start_date?: string | null
          alt_phone?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bank_name?: string | null
          category?: string | null
          city?: string | null
          code: string
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          email?: string | null
          firm_name: string
          gstin?: string | null
          id?: string
          ifsc_code?: string | null
          interested_products?: string[] | null
          kyc_status?: string | null
          last_order_date?: string | null
          minimum_order_value?: number | null
          msme_number?: string | null
          msme_registered?: boolean | null
          msme_type?: string | null
          outstanding_amount?: number | null
          owner_name: string
          pan_number?: string | null
          payment_terms?: string | null
          phone?: string | null
          pincode?: string | null
          registered_address?: string | null
          rejection_reason?: string | null
          return_policy?: string | null
          state?: string | null
          status?: string | null
          tan_number?: string | null
          territory_exclusive?: boolean | null
          updated_at?: string | null
          zone?: string | null
        }
        Update: {
          account_number?: string | null
          address?: string | null
          agreement_end_date?: string | null
          agreement_file_url?: string | null
          agreement_signed?: boolean | null
          agreement_start_date?: string | null
          alt_phone?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bank_name?: string | null
          category?: string | null
          city?: string | null
          code?: string
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          email?: string | null
          firm_name?: string
          gstin?: string | null
          id?: string
          ifsc_code?: string | null
          interested_products?: string[] | null
          kyc_status?: string | null
          last_order_date?: string | null
          minimum_order_value?: number | null
          msme_number?: string | null
          msme_registered?: boolean | null
          msme_type?: string | null
          outstanding_amount?: number | null
          owner_name?: string
          pan_number?: string | null
          payment_terms?: string | null
          phone?: string | null
          pincode?: string | null
          registered_address?: string | null
          rejection_reason?: string | null
          return_policy?: string | null
          state?: string | null
          status?: string | null
          tan_number?: string | null
          territory_exclusive?: boolean | null
          updated_at?: string | null
          zone?: string | null
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
      expense_claims: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          bill_photo: string | null
          city_category: string
          claim_number: string
          created_at: string
          created_by_role: string | null
          da_amount: number
          description: string | null
          distance_travelled: number
          end_date: string
          expense_date: string | null
          expense_type: string
          fuel_amount: number
          hotel_amount: number
          hotel_nights: number
          id: string
          other_amount: number
          other_description: string | null
          rejection_reason: string | null
          start_date: string
          status: string
          submitted_at: string | null
          total_amount: number
          updated_at: string
          user_id: string
          working_days: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          bill_photo?: string | null
          city_category?: string
          claim_number: string
          created_at?: string
          created_by_role?: string | null
          da_amount?: number
          description?: string | null
          distance_travelled?: number
          end_date: string
          expense_date?: string | null
          expense_type?: string
          fuel_amount?: number
          hotel_amount?: number
          hotel_nights?: number
          id?: string
          other_amount?: number
          other_description?: string | null
          rejection_reason?: string | null
          start_date: string
          status?: string
          submitted_at?: string | null
          total_amount?: number
          updated_at?: string
          user_id: string
          working_days?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          bill_photo?: string | null
          city_category?: string
          claim_number?: string
          created_at?: string
          created_by_role?: string | null
          da_amount?: number
          description?: string | null
          distance_travelled?: number
          end_date?: string
          expense_date?: string | null
          expense_type?: string
          fuel_amount?: number
          hotel_amount?: number
          hotel_nights?: number
          id?: string
          other_amount?: number
          other_description?: string | null
          rejection_reason?: string | null
          start_date?: string
          status?: string
          submitted_at?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
          working_days?: number
        }
        Relationships: []
      }
      feedback_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          priority: string
          resolved_at: string | null
          resolved_by: string | null
          response: string | null
          source: string
          source_id: string | null
          source_name: string
          status: string
          subject: string
          ticket_number: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: string
          resolved_at?: string | null
          resolved_by?: string | null
          response?: string | null
          source?: string
          source_id?: string | null
          source_name: string
          status?: string
          subject: string
          ticket_number: string
          type?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          priority?: string
          resolved_at?: string | null
          resolved_by?: string | null
          response?: string | null
          source?: string
          source_id?: string | null
          source_name?: string
          status?: string
          subject?: string
          ticket_number?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_tickets_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_batches: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          batch_number: string
          created_at: string | null
          created_by: string | null
          distributor_id: string | null
          expiry_date: string | null
          id: string
          manufacturing_date: string | null
          product_id: string
          purchase_price: number | null
          quantity: number
          status: string | null
          updated_at: string | null
          warehouse: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          batch_number: string
          created_at?: string | null
          created_by?: string | null
          distributor_id?: string | null
          expiry_date?: string | null
          id?: string
          manufacturing_date?: string | null
          product_id: string
          purchase_price?: number | null
          quantity?: number
          status?: string | null
          updated_at?: string | null
          warehouse?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          batch_number?: string
          created_at?: string | null
          created_by?: string | null
          distributor_id?: string | null
          expiry_date?: string | null
          id?: string
          manufacturing_date?: string | null
          product_id?: string
          purchase_price?: number | null
          quantity?: number
          status?: string | null
          updated_at?: string | null
          warehouse?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_batches_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
          competitors: Json | null
          converted_to: string | null
          country: string | null
          created_at: string | null
          created_by: string
          email: string | null
          expected_conversion_date: string | null
          follow_up_date: string | null
          id: string
          interested_products: string[] | null
          lead_type: string | null
          name: string
          notes: string | null
          phone: string | null
          pincode: string | null
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
          competitors?: Json | null
          converted_to?: string | null
          country?: string | null
          created_at?: string | null
          created_by: string
          email?: string | null
          expected_conversion_date?: string | null
          follow_up_date?: string | null
          id?: string
          interested_products?: string[] | null
          lead_type?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          pincode?: string | null
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
          competitors?: Json | null
          converted_to?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string
          email?: string | null
          expected_conversion_date?: string | null
          follow_up_date?: string | null
          id?: string
          interested_products?: string[] | null
          lead_type?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          pincode?: string | null
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
      leave_balances: {
        Row: {
          created_at: string
          id: string
          leave_type: string
          total_balance: number
          updated_at: string
          used_balance: number
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          leave_type: string
          total_balance?: number
          updated_at?: string
          used_balance?: number
          user_id: string
          year?: number
        }
        Update: {
          created_at?: string
          id?: string
          leave_type?: string
          total_balance?: number
          updated_at?: string
          used_balance?: number
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      leaves: {
        Row: {
          applied_by: string | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          days: number
          duration_type: string | null
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
          applied_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days: number
          duration_type?: string | null
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
          applied_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days?: number
          duration_type?: string | null
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
      pre_order_items: {
        Row: {
          created_at: string | null
          id: string
          pre_order_id: string
          product_id: string | null
          quantity: number
          total_amount: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pre_order_id: string
          product_id?: string | null
          quantity?: number
          total_amount?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pre_order_id?: string
          product_id?: string | null
          quantity?: number
          total_amount?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_order_items_pre_order_id_fkey"
            columns: ["pre_order_id"]
            isOneToOne: false
            referencedRelation: "pre_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_order_schemes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          launch_date: string
          name: string
          pre_order_achieved: number | null
          pre_order_end: string | null
          pre_order_start: string | null
          pre_order_target: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          launch_date: string
          name: string
          pre_order_achieved?: number | null
          pre_order_end?: string | null
          pre_order_start?: string | null
          pre_order_target?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          launch_date?: string
          name?: string
          pre_order_achieved?: number | null
          pre_order_end?: string | null
          pre_order_start?: string | null
          pre_order_target?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pre_orders: {
        Row: {
          actual_delivery: string | null
          advance_collected: number | null
          created_at: string | null
          created_by: string
          distributor_id: string | null
          expected_delivery: string | null
          id: string
          order_number: string
          remarks: string | null
          scheme_id: string | null
          status: string | null
          total_value: number | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery?: string | null
          advance_collected?: number | null
          created_at?: string | null
          created_by: string
          distributor_id?: string | null
          expected_delivery?: string | null
          id?: string
          order_number: string
          remarks?: string | null
          scheme_id?: string | null
          status?: string | null
          total_value?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery?: string | null
          advance_collected?: number | null
          created_at?: string | null
          created_by?: string
          distributor_id?: string | null
          expected_delivery?: string | null
          id?: string
          order_number?: string
          remarks?: string | null
          scheme_id?: string | null
          status?: string | null
          total_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_orders_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_orders_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "pre_order_schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      presentations: {
        Row: {
          completion_rate: number
          created_at: string
          created_by: string | null
          description: string | null
          duration: number
          file_url: string | null
          has_quiz: boolean
          id: string
          product_id: string | null
          quiz_questions: Json | null
          status: string
          title: string
          type: string
          updated_at: string
          view_count: number
        }
        Insert: {
          completion_rate?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: number
          file_url?: string | null
          has_quiz?: boolean
          id?: string
          product_id?: string | null
          quiz_questions?: Json | null
          status?: string
          title: string
          type?: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          completion_rate?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration?: number
          file_url?: string | null
          has_quiz?: boolean
          id?: string
          product_id?: string | null
          quiz_questions?: Json | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "presentations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presentations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
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
      retailer_competitor_analysis: {
        Row: {
          competitor_name: string
          created_at: string | null
          display_quality: string | null
          id: string
          pricing: string | null
          products: string | null
          remarks: string | null
          retailer_id: string
        }
        Insert: {
          competitor_name: string
          created_at?: string | null
          display_quality?: string | null
          id?: string
          pricing?: string | null
          products?: string | null
          remarks?: string | null
          retailer_id: string
        }
        Update: {
          competitor_name?: string
          created_at?: string | null
          display_quality?: string | null
          id?: string
          pricing?: string | null
          products?: string | null
          remarks?: string | null
          retailer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retailer_competitor_analysis_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      retailer_images: {
        Row: {
          created_at: string | null
          id: string
          image_type: string
          image_url: string
          retailer_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_type: string
          image_url: string
          retailer_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_type?: string
          image_url?: string
          retailer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retailer_images_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      retailer_preorders: {
        Row: {
          created_at: string | null
          expected_delivery: string | null
          id: string
          preorder_value: number | null
          product_id: string | null
          quantity: number
          retailer_id: string
        }
        Insert: {
          created_at?: string | null
          expected_delivery?: string | null
          id?: string
          preorder_value?: number | null
          product_id?: string | null
          quantity?: number
          retailer_id: string
        }
        Update: {
          created_at?: string | null
          expected_delivery?: string | null
          id?: string
          preorder_value?: number | null
          product_id?: string | null
          quantity?: number
          retailer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retailer_preorders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retailer_preorders_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
        ]
      }
      retailer_schemes: {
        Row: {
          created_at: string | null
          id: string
          retailer_id: string
          scheme_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          retailer_id: string
          scheme_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          retailer_id?: string
          scheme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "retailer_schemes_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "retailer_schemes_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      retailers: {
        Row: {
          address: string | null
          alt_phone: string | null
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          category: string | null
          city: string | null
          code: string
          competitor_strength: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          distributor_id: string | null
          email: string | null
          employee_count: number | null
          firm_type: string | null
          gps_location: Json | null
          gst_number: string | null
          id: string
          landmark: string | null
          last_order_value: number | null
          last_visit: string | null
          market_share: string | null
          opportunities: string | null
          owner_name: string
          pan_number: string | null
          phone: string | null
          pincode: string | null
          rejection_reason: string | null
          shop_area: string | null
          shop_name: string
          shop_type: string | null
          state: string | null
          status: string | null
          updated_at: string | null
          weekly_off: string | null
          years_in_business: number | null
          zone: string | null
        }
        Insert: {
          address?: string | null
          alt_phone?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          city?: string | null
          code: string
          competitor_strength?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          distributor_id?: string | null
          email?: string | null
          employee_count?: number | null
          firm_type?: string | null
          gps_location?: Json | null
          gst_number?: string | null
          id?: string
          landmark?: string | null
          last_order_value?: number | null
          last_visit?: string | null
          market_share?: string | null
          opportunities?: string | null
          owner_name: string
          pan_number?: string | null
          phone?: string | null
          pincode?: string | null
          rejection_reason?: string | null
          shop_area?: string | null
          shop_name: string
          shop_type?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          weekly_off?: string | null
          years_in_business?: number | null
          zone?: string | null
        }
        Update: {
          address?: string | null
          alt_phone?: string | null
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string | null
          city?: string | null
          code?: string
          competitor_strength?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          distributor_id?: string | null
          email?: string | null
          employee_count?: number | null
          firm_type?: string | null
          gps_location?: Json | null
          gst_number?: string | null
          id?: string
          landmark?: string | null
          last_order_value?: number | null
          last_visit?: string | null
          market_share?: string | null
          opportunities?: string | null
          owner_name?: string
          pan_number?: string | null
          phone?: string | null
          pincode?: string | null
          rejection_reason?: string | null
          shop_area?: string | null
          shop_name?: string
          shop_type?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          weekly_off?: string | null
          years_in_business?: number | null
          zone?: string | null
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
      return_items: {
        Row: {
          created_at: string
          id: string
          product_id: string | null
          product_name: string
          quantity: number
          reason: string | null
          return_id: string
          sku: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_name: string
          quantity?: number
          reason?: string | null
          return_id: string
          sku: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          reason?: string | null
          return_id?: string
          sku?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "return_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_items_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "returns"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          approved_by: string | null
          created_at: string
          created_by: string | null
          id: string
          images: Json | null
          order_id: string | null
          processed_at: string | null
          reason: string | null
          rejection_reason: string | null
          return_number: string
          return_type: string
          source: string
          source_id: string | null
          source_name: string
          status: string
          total_value: number
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          images?: Json | null
          order_id?: string | null
          processed_at?: string | null
          reason?: string | null
          rejection_reason?: string | null
          return_number: string
          return_type?: string
          source?: string
          source_id?: string | null
          source_name: string
          status?: string
          total_value?: number
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          images?: Json | null
          order_id?: string | null
          processed_at?: string | null
          reason?: string | null
          rejection_reason?: string | null
          return_number?: string
          return_type?: string
          source?: string
          source_id?: string | null
          source_name?: string
          status?: string
          total_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "returns_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
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
      sample_budgets: {
        Row: {
          created_at: string
          id: string
          month: number
          monthly_budget: number
          updated_at: string
          used_amount: number
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          month: number
          monthly_budget?: number
          updated_at?: string
          used_amount?: number
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          month?: number
          monthly_budget?: number
          updated_at?: string
          used_amount?: number
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      sample_issues: {
        Row: {
          acknowledged: boolean
          acknowledged_at: string | null
          acknowledgement_photo: string | null
          approved_at: string | null
          approved_by: string | null
          converted_to_order: boolean
          created_at: string
          created_by_role: string | null
          id: string
          issued_by: string
          issued_to_id: string | null
          issued_to_name: string
          issued_to_type: string
          notes: string | null
          order_id: string | null
          order_value: number | null
          quantity: number
          rejection_reason: string | null
          request_date: string | null
          sample_id: string
          status: string
          updated_at: string
        }
        Insert: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledgement_photo?: string | null
          approved_at?: string | null
          approved_by?: string | null
          converted_to_order?: boolean
          created_at?: string
          created_by_role?: string | null
          id?: string
          issued_by: string
          issued_to_id?: string | null
          issued_to_name: string
          issued_to_type?: string
          notes?: string | null
          order_id?: string | null
          order_value?: number | null
          quantity?: number
          rejection_reason?: string | null
          request_date?: string | null
          sample_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledgement_photo?: string | null
          approved_at?: string | null
          approved_by?: string | null
          converted_to_order?: boolean
          created_at?: string
          created_by_role?: string | null
          id?: string
          issued_by?: string
          issued_to_id?: string | null
          issued_to_name?: string
          issued_to_type?: string
          notes?: string | null
          order_id?: string | null
          order_value?: number | null
          quantity?: number
          rejection_reason?: string | null
          request_date?: string | null
          sample_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sample_issues_sample_id_fkey"
            columns: ["sample_id"]
            isOneToOne: false
            referencedRelation: "samples"
            referencedColumns: ["id"]
          },
        ]
      }
      samples: {
        Row: {
          cost_price: number
          created_at: string
          description: string | null
          id: string
          name: string
          product_id: string | null
          sku: string
          status: string
          stock: number
          type: string
          updated_at: string
        }
        Insert: {
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          product_id?: string | null
          sku: string
          status?: string
          stock?: number
          type?: string
          updated_at?: string
        }
        Update: {
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          product_id?: string | null
          sku?: string
          status?: string
          stock?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "samples_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      scheme_claims: {
        Row: {
          applicant_type: string
          approved_at: string | null
          approved_by: string | null
          claim_amount: number | null
          claim_status: string | null
          created_at: string | null
          distributor_id: string | null
          id: string
          remarks: string | null
          retailer_id: string | null
          scheme_id: string
          updated_at: string | null
        }
        Insert: {
          applicant_type?: string
          approved_at?: string | null
          approved_by?: string | null
          claim_amount?: number | null
          claim_status?: string | null
          created_at?: string | null
          distributor_id?: string | null
          id?: string
          remarks?: string | null
          retailer_id?: string | null
          scheme_id: string
          updated_at?: string | null
        }
        Update: {
          applicant_type?: string
          approved_at?: string | null
          approved_by?: string | null
          claim_amount?: number | null
          claim_status?: string | null
          created_at?: string | null
          distributor_id?: string | null
          id?: string
          remarks?: string | null
          retailer_id?: string | null
          scheme_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheme_claims_distributor_id_fkey"
            columns: ["distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheme_claims_retailer_id_fkey"
            columns: ["retailer_id"]
            isOneToOne: false
            referencedRelation: "retailers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheme_claims_scheme_id_fkey"
            columns: ["scheme_id"]
            isOneToOne: false
            referencedRelation: "advanced_schemes"
            referencedColumns: ["id"]
          },
        ]
      }
      schemes: {
        Row: {
          applicable_products: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          discount_percent: number | null
          end_date: string
          free_quantity: number | null
          id: string
          min_quantity: number | null
          name: string
          start_date: string
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          applicable_products?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_percent?: number | null
          end_date: string
          free_quantity?: number | null
          id?: string
          min_quantity?: number | null
          name: string
          start_date: string
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Update: {
          applicable_products?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          discount_percent?: number | null
          end_date?: string
          free_quantity?: number | null
          id?: string
          min_quantity?: number | null
          name?: string
          start_date?: string
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      states: {
        Row: {
          code: string
          country_id: string
          created_at: string
          id: string
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          country_id: string
          created_at?: string
          id?: string
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          country_id?: string
          created_at?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "states_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfer_items: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          quantity: number
          transfer_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          quantity?: number
          transfer_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          quantity?: number
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfer_items_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "stock_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_transfers: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string
          delivered_at: string | null
          dispatched_at: string | null
          from_distributor_id: string | null
          from_location: string
          id: string
          notes: string | null
          status: string | null
          to_distributor_id: string | null
          to_location: string
          transfer_number: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by: string
          delivered_at?: string | null
          dispatched_at?: string | null
          from_distributor_id?: string | null
          from_location: string
          id?: string
          notes?: string | null
          status?: string | null
          to_distributor_id?: string | null
          to_location: string
          transfer_number: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string
          delivered_at?: string | null
          dispatched_at?: string | null
          from_distributor_id?: string | null
          from_location?: string
          id?: string
          notes?: string | null
          status?: string | null
          to_distributor_id?: string | null
          to_location?: string
          transfer_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_transfers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_from_distributor_id_fkey"
            columns: ["from_distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_transfers_to_distributor_id_fkey"
            columns: ["to_distributor_id"]
            isOneToOne: false
            referencedRelation: "distributors"
            referencedColumns: ["id"]
          },
        ]
      }
      targets: {
        Row: {
          achieved_value: number
          city_id: string | null
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          period: string
          start_date: string
          status: string
          target_type: string
          target_value: number
          updated_at: string
          user_id: string
          zone_id: string | null
        }
        Insert: {
          achieved_value?: number
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          period?: string
          start_date: string
          status?: string
          target_type?: string
          target_value?: number
          updated_at?: string
          user_id: string
          zone_id?: string | null
        }
        Update: {
          achieved_value?: number
          city_id?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          period?: string
          start_date?: string
          status?: string
          target_type?: string
          target_value?: number
          updated_at?: string
          user_id?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "targets_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "targets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "targets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "targets_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      territories: {
        Row: {
          city_id: string | null
          country_id: string | null
          created_at: string
          id: string
          manager_id: string | null
          name: string
          parent_id: string | null
          state_id: string | null
          status: string
          type: string
          updated_at: string
          zone_id: string | null
        }
        Insert: {
          city_id?: string | null
          country_id?: string | null
          created_at?: string
          id?: string
          manager_id?: string | null
          name: string
          parent_id?: string | null
          state_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          zone_id?: string | null
        }
        Update: {
          city_id?: string | null
          country_id?: string | null
          created_at?: string
          id?: string
          manager_id?: string | null
          name?: string
          parent_id?: string | null
          state_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "territories_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territories_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territories_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "territories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territories_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "territories_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
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
      zone_states: {
        Row: {
          created_at: string
          id: string
          state_id: string
          zone_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          state_id: string
          zone_id: string
        }
        Update: {
          created_at?: string
          id?: string
          state_id?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zone_states_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zone_states_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          code: string
          country_id: string
          created_at: string
          id: string
          manager_id: string | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          code: string
          country_id: string
          created_at?: string
          id?: string
          manager_id?: string | null
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          code?: string
          country_id?: string
          created_at?: string
          id?: string
          manager_id?: string | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "zones_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zones_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
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
