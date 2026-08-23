import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export type Database = {
  public: {
    Tables: {
      generated_pseudos: {
        Row: {
          id: string
          pseudo: string
          keywords: string[]
          options: any
          length: number
          has_numbers: boolean
          has_special_chars: boolean
          easy_to_remember: boolean
          copied_at: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: Omit<GeneratedPseudo, 'id' | 'created_at'>
        Update: Partial<GeneratedPseudo>
      }
      copied_pseudos: {
        Row: {
          id: string
          pseudo: string
          generated_pseudo_id: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
      }
      donations: {
        Row: {
          id: string
          amount: number
          currency: string
          stripe_session_id: string | null
          stripe_payment_intent_id: string | null
          status: string
          donor_email: string | null
          donor_name: string | null
          message: string | null
          is_anonymous: boolean
          created_at: string
          completed_at: string | null
        }
      }
      site_visits: {
        Row: {
          id: string
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          page_path: string | null
          visit_date: string
          created_at: string
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: any
          updated_at: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          type: string
          is_active: boolean
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string | null
          is_super_admin: boolean
          last_login_at: string | null
          created_at: string
        }
      }
    }
  }
}

export type GeneratedPseudo = Database['public']['Tables']['generated_pseudos']['Row']
export type CopiedPseudo = Database['public']['Tables']['copied_pseudos']['Row']
export type Donation = Database['public']['Tables']['donations']['Row']
export type SiteVisit = Database['public']['Tables']['site_visits']['Row']
export type SiteSetting = Database['public']['Tables']['site_settings']['Row']
export type Announcement = Database['public']['Tables']['announcements']['Row']
export type AdminUser = Database['public']['Tables']['admin_users']['Row']
