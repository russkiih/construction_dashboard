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
      projects: {
        Row: {
          id: string
          name: string
          gc: string
          status: 'pending' | 'awarded' | 'dead'
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          gc: string
          status?: 'pending' | 'awarded' | 'dead'
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          gc?: string
          status?: 'pending' | 'awarded' | 'dead'
          created_at?: string
          user_id?: string
        }
      }
      line_items: {
        Row: {
          id: string
          project_id: string
          service: string
          quantity: number
          unit: string
          unit_price: number
        }
        Insert: {
          id?: string
          project_id: string
          service: string
          quantity: number
          unit: string
          unit_price: number
        }
        Update: {
          id?: string
          project_id?: string
          service?: string
          quantity?: number
          unit?: string
          unit_price?: number
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 