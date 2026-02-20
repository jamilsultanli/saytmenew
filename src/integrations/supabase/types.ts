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
      site_settings: {
        Row: {
          id: string
          site_name: string
          site_description: string | null
          logo_url: string | null
          favicon_url: string | null
          footer_text: string | null
          social_links: Json | null
          updated_at: string
        }
        Insert: {
          id?: string
          site_name?: string
          site_description?: string | null
          logo_url?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          social_links?: Json | null
          updated_at?: string
        }
        Update: {
          id?: string
          site_name?: string
          site_description?: string | null
          logo_url?: string | null
          favicon_url?: string | null
          footer_text?: string | null
          social_links?: Json | null
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name_az: string
          slug: string
          color_theme: string
          created_at: string
        }
        Insert: {
          id?: string
          name_az: string
          slug: string
          color_theme: string
          created_at?: string
        }
        Update: {
          id?: string
          name_az?: string
          slug?: string
          color_theme?: string
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title_az: string
          slug: string
          content_html: string
          thumbnail_url: string
          read_time_az: string
          category_id: string
          card_size: 'hero' | 'square' | 'wide' | 'standard'
          is_featured: boolean
          published_at: string
          seo_title: string | null
          seo_description: string | null
          og_image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title_az: string
          slug: string
          content_html: string
          thumbnail_url: string
          read_time_az: string
          category_id: string
          card_size?: 'hero' | 'square' | 'wide' | 'standard'
          is_featured?: boolean
          published_at?: string
          seo_title?: string | null
          seo_description?: string | null
          og_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title_az?: string
          slug?: string
          content_html?: string
          thumbnail_url?: string
          read_time_az?: string
          category_id?: string
          card_size?: 'hero' | 'square' | 'wide' | 'standard'
          is_featured?: boolean
          published_at?: string
          seo_title?: string | null
          seo_description?: string | null
          og_image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}