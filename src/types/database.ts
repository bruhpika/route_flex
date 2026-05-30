export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          car_name: string | null
          car_emoji: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          car_name?: string | null
          car_emoji?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          car_name?: string | null
          car_emoji?: string | null
          created_at?: string | null
        }
      }
      trips: {
        Row: {
          id: string
          user_id: string | null
          started_at: string
          ended_at: string | null
          duration_secs: number | null
          distance_km: number | null
          top_speed_kmh: number | null
          avg_speed_kmh: number | null
          smoothness_score: number | null
          trip_tag: 'commute' | 'road_trip' | 'midnight' | 'errand' | 'custom' | null
          map_snapshot_url: string | null
          show_route: boolean | null
          spotify_track: Json | null
          ai_caption: string | null
          card_template: 'cyberpunk' | 'minimal' | 'y2k' | null
          accent_color: string | null
          smoothness_details: Json | null
          raw_coords: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          started_at: string
          ended_at?: string | null
          duration_secs?: number | null
          distance_km?: number | null
          top_speed_kmh?: number | null
          avg_speed_kmh?: number | null
          smoothness_score?: number | null
          trip_tag?: 'commute' | 'road_trip' | 'midnight' | 'errand' | 'custom' | null
          map_snapshot_url?: string | null
          show_route?: boolean | null
          spotify_track?: Json | null
          ai_caption?: string | null
          card_template?: 'cyberpunk' | 'minimal' | 'y2k' | null
          accent_color?: string | null
          smoothness_details?: Json | null
          raw_coords?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          started_at?: string
          ended_at?: string | null
          duration_secs?: number | null
          distance_km?: number | null
          top_speed_kmh?: number | null
          avg_speed_kmh?: number | null
          smoothness_score?: number | null
          trip_tag?: 'commute' | 'road_trip' | 'midnight' | 'errand' | 'custom' | null
          map_snapshot_url?: string | null
          show_route?: boolean | null
          spotify_track?: Json | null
          ai_caption?: string | null
          card_template?: 'cyberpunk' | 'minimal' | 'y2k' | null
          accent_color?: string | null
          smoothness_details?: Json | null
          raw_coords?: Json | null
          created_at?: string | null
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
  }
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Trip = Database['public']['Tables']['trips']['Row']
export type TripInsert = Database['public']['Tables']['trips']['Insert']
export type TripUpdate = Database['public']['Tables']['trips']['Update']

export type TripTag = 'commute' | 'road_trip' | 'midnight' | 'errand' | 'custom'
export type CardTemplate = 'cyberpunk' | 'minimal' | 'y2k'

export interface SpotifyTrack {
  name: string
  artist: string
  album_art_url: string
}

export interface GpsPoint {
  lat: number
  lng: number
  speed: number       // km/h
  timestamp: number   // Unix ms
}
