export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      forecast: {
        Row: {
          confidence_lower: number | null
          confidence_upper: number | null
          created_at: string | null
          date: string
          id: string
          predicted_visitors: number
          weather_id: string | null
        }
        Insert: {
          confidence_lower?: number | null
          confidence_upper?: number | null
          created_at?: string | null
          date: string
          id?: string
          predicted_visitors: number
          weather_id?: string | null
        }
        Update: {
          confidence_lower?: number | null
          confidence_upper?: number | null
          created_at?: string | null
          date?: string
          id?: string
          predicted_visitors?: number
          weather_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forecast_weather_id_fkey"
            columns: ["weather_id"]
            isOneToOne: false
            referencedRelation: "weather_data"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          id: number
          last_updated: string | null
          openweather_api_key: string | null
          postal_code: string | null
        }
        Insert: {
          id: number
          last_updated?: string | null
          openweather_api_key?: string | null
          postal_code?: string | null
        }
        Update: {
          id?: number
          last_updated?: string | null
          openweather_api_key?: string | null
          postal_code?: string | null
        }
        Relationships: []
      }
      visitor_data: {
        Row: {
          created_at: string | null
          date: string
          day_of_week: string | null
          id: string
          is_holiday: boolean | null
          is_school_break: boolean | null
          is_weekend: boolean | null
          special_event: string | null
          visitor_count: number
        }
        Insert: {
          created_at?: string | null
          date: string
          day_of_week?: string | null
          id?: string
          is_holiday?: boolean | null
          is_school_break?: boolean | null
          is_weekend?: boolean | null
          special_event?: string | null
          visitor_count: number
        }
        Update: {
          created_at?: string | null
          date?: string
          day_of_week?: string | null
          id?: string
          is_holiday?: boolean | null
          is_school_break?: boolean | null
          is_weekend?: boolean | null
          special_event?: string | null
          visitor_count?: number
        }
        Relationships: []
      }
      weather_data: {
        Row: {
          condition: string | null
          created_at: string | null
          date: string
          description: string | null
          feels_like: number | null
          humidity: number | null
          icon: string | null
          id: string
          precipitation: number | null
          temperature: number | null
          wind_speed: number | null
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          feels_like?: number | null
          humidity?: number | null
          icon?: string | null
          id?: string
          precipitation?: number | null
          temperature?: number | null
          wind_speed?: number | null
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          feels_like?: number | null
          humidity?: number | null
          icon?: string | null
          id?: string
          precipitation?: number | null
          temperature?: number | null
          wind_speed?: number | null
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
