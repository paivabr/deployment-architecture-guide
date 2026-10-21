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
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      checkout_settings: {
        Row: {
          cancel_page_url: string | null
          checkout_expiry_minutes: number | null
          checkout_message: string | null
          config: Json | null
          created_at: string
          default_provider_id: string | null
          id: string
          max_installments: number | null
          min_installment_value: number | null
          privacy_url: string | null
          require_cpf: boolean
          require_phone: boolean
          success_page_url: string | null
          terms_url: string | null
          updated_at: string
        }
        Insert: {
          cancel_page_url?: string | null
          checkout_expiry_minutes?: number | null
          checkout_message?: string | null
          config?: Json | null
          created_at?: string
          default_provider_id?: string | null
          id?: string
          max_installments?: number | null
          min_installment_value?: number | null
          privacy_url?: string | null
          require_cpf?: boolean
          require_phone?: boolean
          success_page_url?: string | null
          terms_url?: string | null
          updated_at?: string
        }
        Update: {
          cancel_page_url?: string | null
          checkout_expiry_minutes?: number | null
          checkout_message?: string | null
          config?: Json | null
          created_at?: string
          default_provider_id?: string | null
          id?: string
          max_installments?: number | null
          min_installment_value?: number | null
          privacy_url?: string | null
          require_cpf?: boolean
          require_phone?: boolean
          success_page_url?: string | null
          terms_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkout_settings_default_provider_id_fkey"
            columns: ["default_provider_id"]
            isOneToOne: false
            referencedRelation: "payment_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applies_to_categories: string[] | null
          applies_to_courses: string[] | null
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_discount_value: number | null
          min_purchase_value: number | null
          per_user_limit: number | null
          updated_at: string
          usage_count: number
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applies_to_categories?: string[] | null
          applies_to_courses?: string[] | null
          code: string
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_discount_value?: number | null
          min_purchase_value?: number | null
          per_user_limit?: number | null
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applies_to_categories?: string[] | null
          applies_to_courses?: string[] | null
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_discount_value?: number | null
          min_purchase_value?: number | null
          per_user_limit?: number | null
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          category_id: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          is_featured: boolean
          meta_description: string | null
          meta_title: string | null
          price: number
          promotional_ends_at: string | null
          promotional_price: number | null
          published_at: string | null
          short_description: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          teacher_id: string | null
          thumbnail_url: string | null
          title: string
          total_duration_minutes: number | null
          total_lessons: number | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          meta_description?: string | null
          meta_title?: string | null
          price?: number
          promotional_ends_at?: string | null
          promotional_price?: number | null
          published_at?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          teacher_id?: string | null
          thumbnail_url?: string | null
          title: string
          total_duration_minutes?: number | null
          total_lessons?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_featured?: boolean
          meta_description?: string | null
          meta_title?: string | null
          price?: number
          promotional_ends_at?: string | null
          promotional_price?: number | null
          published_at?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          teacher_id?: string | null
          thumbnail_url?: string | null
          title?: string
          total_duration_minutes?: number | null
          total_lessons?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_values: {
        Row: {
          created_at: string
          custom_field_id: string
          entity_id: string
          id: string
          updated_at: string
          value: Json | null
        }
        Insert: {
          created_at?: string
          custom_field_id: string
          entity_id: string
          id?: string
          updated_at?: string
          value?: Json | null
        }
        Update: {
          created_at?: string
          custom_field_id?: string
          entity_id?: string
          id?: string
          updated_at?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_custom_field_id_fkey"
            columns: ["custom_field_id"]
            isOneToOne: false
            referencedRelation: "custom_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_fields: {
        Row: {
          created_at: string
          entity_type: string
          field_label: string
          field_name: string
          field_options: Json | null
          field_type: Database["public"]["Enums"]["custom_field_type"]
          id: string
          is_active: boolean
          is_required: boolean
          sort_order: number
        }
        Insert: {
          created_at?: string
          entity_type: string
          field_label: string
          field_name: string
          field_options?: Json | null
          field_type: Database["public"]["Enums"]["custom_field_type"]
          id?: string
          is_active?: boolean
          is_required?: boolean
          sort_order?: number
        }
        Update: {
          created_at?: string
          entity_type?: string
          field_label?: string
          field_name?: string
          field_options?: Json | null
          field_type?: Database["public"]["Enums"]["custom_field_type"]
          id?: string
          is_active?: boolean
          is_required?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string
          enrolled_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          last_accessed_at: string | null
          order_id: string | null
          payment_id: string | null
          progress_percent: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string
          enrolled_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_accessed_at?: string | null
          order_id?: string | null
          payment_id?: string | null
          progress_percent?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string
          enrolled_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_accessed_at?: string | null
          order_id?: string | null
          payment_id?: string | null
          progress_percent?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      home_sections: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          is_active: boolean
          section_type: string
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          section_type: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          section_type?: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lesson_assets: {
        Row: {
          created_at: string
          file_size_bytes: number | null
          file_type: string | null
          file_url: string
          id: string
          lesson_id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          lesson_id: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          file_size_bytes?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          lesson_id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_assets_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          id: string
          is_free: boolean
          is_published: boolean
          lesson_type: Database["public"]["Enums"]["lesson_type"]
          module_id: string
          sort_order: number
          title: string
          updated_at: string
          video_duration_seconds: number | null
          video_id: string | null
          video_provider: string | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          is_published?: boolean
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          module_id: string
          sort_order?: number
          title: string
          updated_at?: string
          video_duration_seconds?: number | null
          video_id?: string | null
          video_provider?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          is_published?: boolean
          lesson_type?: Database["public"]["Enums"]["lesson_type"]
          module_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
          video_duration_seconds?: number | null
          video_id?: string | null
          video_provider?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          opens_new_tab: boolean
          page_id: string | null
          parent_id: string | null
          position: Database["public"]["Enums"]["menu_position"]
          sort_order: number
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          opens_new_tab?: boolean
          page_id?: string | null
          parent_id?: string | null
          position?: Database["public"]["Enums"]["menu_position"]
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          opens_new_tab?: boolean
          page_id?: string | null
          parent_id?: string | null
          position?: Database["public"]["Enums"]["menu_position"]
          sort_order?: number
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          description: string | null
          id: string
          is_free: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          course_id: string
          created_at: string
          discount: number | null
          final_price: number
          id: string
          order_id: string
          price: number
        }
        Insert: {
          course_id: string
          created_at?: string
          discount?: number | null
          final_price: number
          id?: string
          order_id: string
          price: number
        }
        Update: {
          course_id?: string
          created_at?: string
          discount?: number | null
          final_price?: number
          id?: string
          order_id?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coupon_code: string | null
          coupon_id: string | null
          created_at: string
          customer_cpf: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          discount_amount: number | null
          id: string
          metadata: Json | null
          notes: string | null
          order_number: string
          paid_at: string | null
          payment_provider_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          customer_cpf?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number: string
          paid_at?: string | null
          payment_provider_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          customer_cpf?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          payment_provider_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_payment_provider_id_fkey"
            columns: ["payment_provider_id"]
            isOneToOne: false
            referencedRelation: "payment_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          featured_image_url: string | null
          id: string
          menu_order: number | null
          menu_position: Database["public"]["Enums"]["menu_position"] | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          show_in_menu: boolean
          slug: string
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          featured_image_url?: string | null
          id?: string
          menu_order?: number | null
          menu_position?: Database["public"]["Enums"]["menu_position"] | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          show_in_menu?: boolean
          slug: string
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          featured_image_url?: string | null
          id?: string
          menu_order?: number | null
          menu_position?: Database["public"]["Enums"]["menu_position"] | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          show_in_menu?: boolean
          slug?: string
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods_config: {
        Row: {
          config: Json | null
          created_at: string
          description: string | null
          display_name: string | null
          icon_url: string | null
          id: string
          is_enabled: boolean
          max_installments: number | null
          method_type: string
          min_installment_value: number | null
          provider_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          description?: string | null
          display_name?: string | null
          icon_url?: string | null
          id?: string
          is_enabled?: boolean
          max_installments?: number | null
          method_type: string
          min_installment_value?: number | null
          provider_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          description?: string | null
          display_name?: string | null
          icon_url?: string | null
          id?: string
          is_enabled?: boolean
          max_installments?: number | null
          method_type?: string
          min_installment_value?: number | null
          provider_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_config_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "payment_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_provider_credentials: {
        Row: {
          created_at: string
          credential_type: string
          encrypted_value: string
          id: string
          provider_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credential_type: string
          encrypted_value: string
          id?: string
          provider_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credential_type?: string
          encrypted_value?: string
          id?: string
          provider_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_provider_credentials_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "payment_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_providers: {
        Row: {
          config: Json | null
          created_at: string
          description: string | null
          environment: string
          id: string
          is_default: boolean
          last_test_at: string | null
          last_test_result: Json | null
          name: string
          provider_type: string
          status: Database["public"]["Enums"]["provider_status"]
          updated_at: string
          webhook_configured: boolean
          webhook_url: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string
          description?: string | null
          environment?: string
          id?: string
          is_default?: boolean
          last_test_at?: string | null
          last_test_result?: Json | null
          name: string
          provider_type: string
          status?: Database["public"]["Enums"]["provider_status"]
          updated_at?: string
          webhook_configured?: boolean
          webhook_url?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string
          description?: string | null
          environment?: string
          id?: string
          is_default?: boolean
          last_test_at?: string | null
          last_test_result?: Json | null
          name?: string
          provider_type?: string
          status?: Database["public"]["Enums"]["provider_status"]
          updated_at?: string
          webhook_configured?: boolean
          webhook_url?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          boleto_barcode: string | null
          boleto_expiration: string | null
          boleto_url: string | null
          card_brand: string | null
          card_last_four: string | null
          created_at: string
          error_message: string | null
          external_id: string | null
          gateway_response: Json | null
          id: string
          installments: number | null
          order_id: string
          paid_at: string | null
          payment_method: string
          pix_expiration: string | null
          pix_qr_code: string | null
          pix_qr_code_base64: string | null
          provider_id: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          boleto_barcode?: string | null
          boleto_expiration?: string | null
          boleto_url?: string | null
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string
          error_message?: string | null
          external_id?: string | null
          gateway_response?: Json | null
          id?: string
          installments?: number | null
          order_id: string
          paid_at?: string | null
          payment_method: string
          pix_expiration?: string | null
          pix_qr_code?: string | null
          pix_qr_code_base64?: string | null
          provider_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          boleto_barcode?: string | null
          boleto_expiration?: string | null
          boleto_url?: string | null
          card_brand?: string | null
          card_last_four?: string | null
          created_at?: string
          error_message?: string | null
          external_id?: string | null
          gateway_response?: Json | null
          id?: string
          installments?: number | null
          order_id?: string
          paid_at?: string | null
          payment_method?: string
          pix_expiration?: string | null
          pix_qr_code?: string | null
          pix_qr_code_base64?: string | null
          provider_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "payment_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          scope: Database["public"]["Enums"]["setting_scope"]
          updated_at: string
          updated_by: string | null
          validation_rules: Json | null
          value: Json | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          scope?: Database["public"]["Enums"]["setting_scope"]
          updated_at?: string
          updated_by?: string | null
          validation_rules?: Json | null
          value?: Json | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          scope?: Database["public"]["Enums"]["setting_scope"]
          updated_at?: string
          updated_by?: string | null
          validation_rules?: Json | null
          value?: Json | null
        }
        Relationships: []
      }
      settings_versions: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          setting_id: string
          value: Json | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          setting_id: string
          value?: Json | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          setting_id?: string
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_versions_setting_id_fkey"
            columns: ["setting_id"]
            isOneToOne: false
            referencedRelation: "settings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json
          processed_at: string | null
          provider: string
          retry_count: number
          status: Database["public"]["Enums"]["webhook_status"]
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_id: string
          event_type: string
          id?: string
          payload: Json
          processed_at?: string | null
          provider: string
          retry_count?: number
          status?: Database["public"]["Enums"]["webhook_status"]
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          processed_at?: string | null
          provider?: string
          retry_count?: number
          status?: Database["public"]["Enums"]["webhook_status"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_first_admin: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_moderator_or_above: { Args: never; Returns: boolean }
      is_teacher_or_above: { Args: never; Returns: boolean }
    }
    Enums: {
      content_status: "draft" | "published" | "archived"
      custom_field_type:
        | "text"
        | "number"
        | "boolean"
        | "date"
        | "select"
        | "multiselect"
        | "url"
        | "image"
      lesson_type: "video" | "text" | "quiz" | "download" | "live"
      menu_position: "header" | "footer" | "both"
      order_status: "pending" | "paid" | "cancelled" | "refunded"
      payment_status:
        | "pending"
        | "processing"
        | "approved"
        | "declined"
        | "cancelled"
        | "refunded"
        | "chargeback"
      provider_status:
        | "not_configured"
        | "test_pending"
        | "validating"
        | "working"
        | "attention"
        | "failed"
        | "disabled"
      setting_scope: "public" | "private" | "secret" | "admin" | "draft"
      user_role: "admin" | "moderator" | "teacher" | "student"
      webhook_status:
        | "received"
        | "processing"
        | "processed"
        | "failed"
        | "ignored"
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
      content_status: ["draft", "published", "archived"],
      custom_field_type: [
        "text",
        "number",
        "boolean",
        "date",
        "select",
        "multiselect",
        "url",
        "image",
      ],
      lesson_type: ["video", "text", "quiz", "download", "live"],
      menu_position: ["header", "footer", "both"],
      order_status: ["pending", "paid", "cancelled", "refunded"],
      payment_status: [
        "pending",
        "processing",
        "approved",
        "declined",
        "cancelled",
        "refunded",
        "chargeback",
      ],
      provider_status: [
        "not_configured",
        "test_pending",
        "validating",
        "working",
        "attention",
        "failed",
        "disabled",
      ],
      setting_scope: ["public", "private", "secret", "admin", "draft"],
      user_role: ["admin", "moderator", "teacher", "student"],
      webhook_status: [
        "received",
        "processing",
        "processed",
        "failed",
        "ignored",
      ],
    },
  },
} as const
