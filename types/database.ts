export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          product: string | null
          problem: string | null
          icp: string | null
          stage: string | null
          traction: string | null
          channels: string | null
          goal_30: string | null
          time_available: string | null
          budget: string | null
          archetype: string | null
          bottleneck: string | null
          top_channels: string[] | null
          traction_score: number | null
          onboarded: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          why: string | null
          steps: string[] | null
          outcome: string | null
          time_required: string | null
          difficulty: string | null
          status: string
          priority: number | null
          due_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['chat_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['chat_messages']['Insert']>
      }
      experiments: {
        Row: {
          id: string
          user_id: string
          hypothesis: string
          channel: string | null
          metric: string | null
          status: 'Running' | 'Won' | 'Lost' | 'Paused'
          result: string | null
          learning: string | null
          cmo_analysis: string | null
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['experiments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['experiments']['Insert']>
      }
      results: {
        Row: {
          id: string
          user_id: string
          task_id: string | null
          task_title: string | null
          execution: string
          cmo_feedback: string | null
          next_actions: string[] | null
          score: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['results']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['results']['Insert']>
      }
      content_items: {
        Row: {
          id: string
          user_id: string
          week_start: string | null
          day: string | null
          type: string | null
          hook: string | null
          topic: string | null
          cta: string | null
          full_post: string | null
          platform: string | null
          status: 'draft' | 'scheduled' | 'published'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['content_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['content_items']['Insert']>
      }
    }
  }
}

// App types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type Experiment = Database['public']['Tables']['experiments']['Row']
export type Result = Database['public']['Tables']['results']['Row']
export type ContentItem = Database['public']['Tables']['content_items']['Row']
