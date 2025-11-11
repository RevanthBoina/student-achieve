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
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          record_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          record_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          record_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "records"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          broken_records_count: number | null
          created_at: string | null
          education_info: string | null
          email: string
          followers_count: number | null
          following_count: number | null
          full_name: string | null
          id: string
          id_card_url: string | null
          id_card_verified: boolean | null
          is_public: boolean | null
          is_verified: boolean | null
          records_count: number | null
          school: string | null
          school_email: string | null
          school_email_verified: boolean | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          broken_records_count?: number | null
          created_at?: string | null
          education_info?: string | null
          email: string
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          id: string
          id_card_url?: string | null
          id_card_verified?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          records_count?: number | null
          school?: string | null
          school_email?: string | null
          school_email_verified?: boolean | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          broken_records_count?: number | null
          created_at?: string | null
          education_info?: string | null
          email?: string
          followers_count?: number | null
          following_count?: number | null
          full_name?: string | null
          id?: string
          id_card_url?: string | null
          id_card_verified?: boolean | null
          is_public?: boolean | null
          is_verified?: boolean | null
          records_count?: number | null
          school?: string | null
          school_email?: string | null
          school_email_verified?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reactions: {
        Row: {
          created_at: string | null
          id: string
          record_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          record_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          record_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "records"
            referencedColumns: ["id"]
          },
        ]
      }
      record_breaks: {
        Row: {
          created_at: string | null
          description: string | null
          evidence_url: string
          id: string
          record_id: string
          status: Database["public"]["Enums"]["verification_status"] | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          evidence_url: string
          id?: string
          record_id: string
          status?: Database["public"]["Enums"]["verification_status"] | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          evidence_url?: string
          id?: string
          record_id?: string
          status?: Database["public"]["Enums"]["verification_status"] | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "record_breaks_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "records"
            referencedColumns: ["id"]
          },
        ]
      }
      records: {
        Row: {
          broken_at: string | null
          broken_by: string | null
          category_id: string | null
          comments_count: number | null
          created_at: string | null
          description: string
          engagement_score: number | null
          evidence_url: string | null
          id: string
          media_url: string | null
          reactions_count: number | null
          status: Database["public"]["Enums"]["record_status"] | null
          title: string
          updated_at: string | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
          views_count: number | null
        }
        Insert: {
          broken_at?: string | null
          broken_by?: string | null
          category_id?: string | null
          comments_count?: number | null
          created_at?: string | null
          description: string
          engagement_score?: number | null
          evidence_url?: string | null
          id?: string
          media_url?: string | null
          reactions_count?: number | null
          status?: Database["public"]["Enums"]["record_status"] | null
          title: string
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
          views_count?: number | null
        }
        Update: {
          broken_at?: string | null
          broken_by?: string | null
          category_id?: string | null
          comments_count?: number | null
          created_at?: string | null
          description?: string
          engagement_score?: number | null
          evidence_url?: string | null
          id?: string
          media_url?: string | null
          reactions_count?: number | null
          status?: Database["public"]["Enums"]["record_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "records_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verifications: {
        Row: {
          break_id: string | null
          collaborator_id: string
          comment: string | null
          created_at: string | null
          id: string
          record_id: string | null
          status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          break_id?: string | null
          collaborator_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          record_id?: string | null
          status: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          break_id?: string | null
          collaborator_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          record_id?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: [
          {
            foreignKeyName: "verifications_break_id_fkey"
            columns: ["break_id"]
            isOneToOne: false
            referencedRelation: "record_breaks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verifications_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "records"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_engagement_score: {
        Args: { record_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "collaborator" | "admin"
      record_status: "pending" | "verified" | "rejected" | "broken"
      verification_status: "pending" | "approved" | "rejected"
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
      app_role: ["user", "collaborator", "admin"],
      record_status: ["pending", "verified", "rejected", "broken"],
      verification_status: ["pending", "approved", "rejected"],
    },
  },
} as const
