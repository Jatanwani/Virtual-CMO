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
          company_name: string | null
          company_logo_url: string | null
          website: string | null
          team_size: string | null
          founder_phone: string | null
          founder_email: string | null
          linkedin_url: string | null
          twitter_url: string | null
          instagram_url: string | null
          facebook_url: string | null
          linkedin_connected: boolean | null
          twitter_connected: boolean | null
          instagram_connected: boolean | null
          facebook_connected: boolean | null
          linkedin_handle: string | null
          twitter_handle: string | null
          instagram_handle: string | null
          facebook_handle: string | null
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
          day_number: number | null
          week_number: number | null
          type: string | null
          hook: string | null
          topic: string | null
          headline: string | null
          body: string | null
          cta: string | null
          full_post: string | null
          platform: string | null
          hashtags: string[] | null
          image_prompt: string | null
          image_url: string | null
          scheduled_at: string | null
          approved: boolean | null
          status: 'draft' | 'scheduled' | 'published'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['content_items']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['content_items']['Insert']>
      }
      social_accounts: {
        Row: {
          id: string
          user_id: string
          platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook'
          account_name: string | null
          account_id: string | null
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          connected: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['social_accounts']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['social_accounts']['Insert']>
      }
      scheduled_posts: {
        Row: {
          id: string
          user_id: string
          content_item_id: string | null
          platform: string
          content: string
          image_url: string | null
          scheduled_at: string
          status: 'pending' | 'posted' | 'failed' | 'cancelled'
          error_message: string | null
          retry_count: number
          posted_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['scheduled_posts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['scheduled_posts']['Insert']>
      }
      generated_images: {
        Row: {
          id: string
          user_id: string
          content_item_id: string | null
          prompt: string | null
          image_url: string
          platform: string | null
          width: number | null
          height: number | null
          provider: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['generated_images']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['generated_images']['Insert']>
      }
      landing_pages: {
        Row: {
          id: string
          user_id: string
          title: string
          slug: string | null
          html_content: string | null
          css_content: string | null
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['landing_pages']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['landing_pages']['Insert']>
      }
      post_analytics: {
        Row: {
          id: string
          user_id: string
          scheduled_post_id: string | null
          platform: string | null
          impressions: number
          likes: number
          comments: number
          shares: number
          clicks: number
          recorded_at: string
        }
        Insert: Omit<Database['public']['Tables']['post_analytics']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['post_analytics']['Insert']>
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
export type SocialAccount = Database['public']['Tables']['social_accounts']['Row']
export type ScheduledPost = Database['public']['Tables']['scheduled_posts']['Row']
export type GeneratedImage = Database['public']['Tables']['generated_images']['Row']
export type LandingPage = Database['public']['Tables']['landing_pages']['Row']
export type PostAnalytics = Database['public']['Tables']['post_analytics']['Row']
