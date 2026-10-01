// Tipe database Supabase, mengikuti supabase/schema.sql.
// Bisa diganti hasil generate: npx supabase gen types typescript --project-id <id> > types/database.ts

type Timestamp = string

type OwnedVideoRow = { user_id: string; video_id: string; created_at: Timestamp }

export type Database = {
  __InternalSupabase: { PostgrestVersion: "12" }
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string; avatar_url: string | null; created_at: Timestamp }
        Insert: { id: string; display_name: string; avatar_url?: string | null; created_at?: Timestamp }
        Update: { display_name?: string; avatar_url?: string | null }
        Relationships: []
      }
      subscriptions: {
        Row: { user_id: string; channel_id: string; created_at: Timestamp }
        Insert: { user_id: string; channel_id: string; created_at?: Timestamp }
        Update: { created_at?: Timestamp }
        Relationships: []
      }
      video_reactions: {
        Row: { user_id: string; video_id: string; value: 1 | -1; created_at: Timestamp; updated_at: Timestamp }
        Insert: { user_id: string; video_id: string; value: 1 | -1 }
        Update: { value?: 1 | -1 }
        Relationships: []
      }
      comments: {
        Row: { id: string; user_id: string; video_id: string; content: string; created_at: Timestamp }
        Insert: { user_id: string; video_id: string; content: string }
        Update: { content?: string }
        Relationships: []
      }
      watch_later: {
        Row: OwnedVideoRow
        Insert: { user_id: string; video_id: string; created_at?: Timestamp }
        Update: { created_at?: Timestamp }
        Relationships: []
      }
      favorites: {
        Row: OwnedVideoRow
        Insert: { user_id: string; video_id: string; created_at?: Timestamp }
        Update: { created_at?: Timestamp }
        Relationships: []
      }
      watch_history: {
        Row: { user_id: string; video_id: string; last_position_seconds: number; updated_at: Timestamp }
        Insert: { user_id: string; video_id: string; last_position_seconds?: number }
        Update: { last_position_seconds?: number }
        Relationships: []
      }
      parental_settings: {
        // Catatan: dari browser hanya kolom non-sensitif yang bisa dibaca
        // (pin_hash, pin_failed_attempts, pin_locked_until hanya untuk service role).
        Row: {
          user_id: string
          daily_limit_minutes: number | null
          /** "HH:MM:SS" */
          bedtime_start: string | null
          bedtime_end: string | null
          break_reminder_minutes: number | null
          pin_hash: string | null
          pin_failed_attempts: number
          pin_locked_until: Timestamp | null
          has_pin: boolean
          updated_at: Timestamp
        }
        Insert: {
          user_id: string
          daily_limit_minutes?: number | null
          bedtime_start?: string | null
          bedtime_end?: string | null
          break_reminder_minutes?: number | null
          pin_hash?: string | null
          pin_failed_attempts?: number
          pin_locked_until?: Timestamp | null
        }
        Update: {
          daily_limit_minutes?: number | null
          bedtime_start?: string | null
          bedtime_end?: string | null
          break_reminder_minutes?: number | null
          pin_hash?: string | null
          pin_failed_attempts?: number
          pin_locked_until?: Timestamp | null
        }
        Relationships: []
      }
      screen_time: {
        Row: {
          user_id: string
          date: string
          seconds_watched: number
          bonus_minutes: number
          unlocked: boolean
          override_until: Timestamp | null
        }
        Insert: {
          user_id: string
          date: string
          seconds_watched?: number
          bonus_minutes?: number
          unlocked?: boolean
          override_until?: Timestamp | null
        }
        Update: {
          seconds_watched?: number
          bonus_minutes?: number
          unlocked?: boolean
          override_until?: Timestamp | null
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      add_screen_time: {
        Args: { p_date: string; p_seconds: number }
        Returns: number
      }
      get_video_reaction_counts: {
        Args: { p_video_id: string }
        Returns: { likes: number; dislikes: number }[]
      }
      get_channel_subscriber_count: {
        Args: { p_channel_id: string }
        Returns: number
      }
      get_video_comments: {
        Args: { p_video_id: string; p_limit?: number }
        Returns: {
          id: string
          user_id: string
          video_id: string
          content: string
          created_at: Timestamp
          author_name: string | null
          author_avatar: string | null
        }[]
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
