export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'COUPLE' | 'PLANNER' | 'VENDOR' | 'ADMIN'
export type VendorCategory =
  | 'VENUE' | 'PHOTOGRAPHER' | 'VIDEOGRAPHER' | 'CATERER' | 'FLORIST'
  | 'MUSIC_DJ' | 'MUSIC_BAND' | 'BAKER' | 'DECORATOR' | 'MAKEUP_ARTIST'
  | 'HAIR_STYLIST' | 'TRANSPORTATION' | 'INVITATIONS' | 'WEDDING_PLANNER' | 'OTHER'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
export type RSVPStatus = 'PENDING' | 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
export type ExpenseStatus = 'PLANNED' | 'PAID' | 'PENDING' | 'OVERDUE'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          role: UserRole
          avatar: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          role?: UserRole
          avatar?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          role?: UserRole
          avatar?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      couple_profiles: {
        Row: {
          id: string
          user_id: string
          partner_name: string | null
          wedding_date: string | null
          budget: number | null
          guest_count: number | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          partner_name?: string | null
          wedding_date?: string | null
          budget?: number | null
          guest_count?: number | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          partner_name?: string | null
          wedding_date?: string | null
          budget?: number | null
          guest_count?: number | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      planner_profiles: {
        Row: {
          id: string
          user_id: string
          company: string | null
          bio: string | null
          years_experience: number | null
          portfolio: string[]
          certifications: string[]
          rating: number
          review_count: number
          price_range: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company?: string | null
          bio?: string | null
          years_experience?: number | null
          portfolio?: string[]
          certifications?: string[]
          rating?: number
          review_count?: number
          price_range?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company?: string | null
          bio?: string | null
          years_experience?: number | null
          portfolio?: string[]
          certifications?: string[]
          rating?: number
          review_count?: number
          price_range?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      vendor_profiles: {
        Row: {
          id: string
          user_id: string
          business_name: string
          category: VendorCategory
          description: string | null
          service_area: string[]
          portfolio: string[]
          price_range: string | null
          rating: number
          review_count: number
          website: string | null
          instagram: string | null
          facebook: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          business_name: string
          category: VendorCategory
          description?: string | null
          service_area?: string[]
          portfolio?: string[]
          price_range?: string | null
          rating?: number
          review_count?: number
          website?: string | null
          instagram?: string | null
          facebook?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          business_name?: string
          category?: VendorCategory
          description?: string | null
          service_area?: string[]
          portfolio?: string[]
          price_range?: string | null
          rating?: number
          review_count?: number
          website?: string | null
          instagram?: string | null
          facebook?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          user_id: string
          planner_id: string | null
          name: string
          type: string
          date: string
          time: string | null
          venue: string | null
          venue_address: string | null
          budget: number | null
          guest_count: number | null
          description: string | null
          website_slug: string | null
          website_theme: string
          website_enabled: boolean
          couple_story: string | null
          couple_photo: string | null
          partner1_name: string | null
          partner2_name: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          planner_id?: string | null
          name: string
          type?: string
          date: string
          time?: string | null
          venue?: string | null
          venue_address?: string | null
          budget?: number | null
          guest_count?: number | null
          description?: string | null
          website_slug?: string | null
          website_theme?: string
          website_enabled?: boolean
          couple_story?: string | null
          couple_photo?: string | null
          partner1_name?: string | null
          partner2_name?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          planner_id?: string | null
          name?: string
          type?: string
          date?: string
          time?: string | null
          venue?: string | null
          venue_address?: string | null
          budget?: number | null
          guest_count?: number | null
          description?: string | null
          website_slug?: string | null
          website_theme?: string
          website_enabled?: boolean
          couple_story?: string | null
          couple_photo?: string | null
          partner1_name?: string | null
          partner2_name?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      event_collaborators: {
        Row: {
          id: string
          event_id: string
          email: string
          role: string
          invited_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          event_id: string
          email: string
          role?: string
          invited_at?: string
          accepted_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          email?: string
          role?: string
          invited_at?: string
          accepted_at?: string | null
        }
      }
      guests: {
        Row: {
          id: string
          event_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          category: string | null
          plus_one: boolean
          plus_one_name: string | null
          rsvp_status: RSVPStatus
          rsvp_date: string | null
          dietary_restrictions: string | null
          table_number: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          category?: string | null
          plus_one?: boolean
          plus_one_name?: string | null
          rsvp_status?: RSVPStatus
          rsvp_date?: string | null
          dietary_restrictions?: string | null
          table_number?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          category?: string | null
          plus_one?: boolean
          plus_one_name?: string | null
          rsvp_status?: RSVPStatus
          rsvp_date?: string | null
          dietary_restrictions?: string | null
          table_number?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          event_id: string
          assigned_to_id: string | null
          title: string
          description: string | null
          due_date: string | null
          priority: TaskPriority
          status: TaskStatus
          category: string | null
          order: number
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          event_id: string
          assigned_to_id?: string | null
          title: string
          description?: string | null
          due_date?: string | null
          priority?: TaskPriority
          status?: TaskStatus
          category?: string | null
          order?: number
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          assigned_to_id?: string | null
          title?: string
          description?: string | null
          due_date?: string | null
          priority?: TaskPriority
          status?: TaskStatus
          category?: string | null
          order?: number
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      checklist_items: {
        Row: {
          id: string
          event_id: string
          title: string
          category: string | null
          is_completed: boolean
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          title: string
          category?: string | null
          is_completed?: boolean
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          title?: string
          category?: string | null
          is_completed?: boolean
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      timeline_items: {
        Row: {
          id: string
          event_id: string
          title: string
          description: string | null
          time: string
          duration: number | null
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          title: string
          description?: string | null
          time: string
          duration?: number | null
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          title?: string
          description?: string | null
          time?: string
          duration?: number | null
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          event_id: string
          name: string
          category: string
          estimated_cost: number
          actual_cost: number | null
          paid_amount: number
          status: ExpenseStatus
          due_date: string | null
          paid_date: string | null
          vendor: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          category: string
          estimated_cost: number
          actual_cost?: number | null
          paid_amount?: number
          status?: ExpenseStatus
          due_date?: string | null
          paid_date?: string | null
          vendor?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          category?: string
          estimated_cost?: number
          actual_cost?: number | null
          paid_amount?: number
          status?: ExpenseStatus
          due_date?: string | null
          paid_date?: string | null
          vendor?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          event_id: string
          vendor_id: string
          status: BookingStatus
          service_date: string
          service_details: string | null
          agreed_price: number | null
          deposit_paid: number | null
          deposit_due_date: string | null
          final_payment_due: string | null
          notes: string | null
          contract_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          vendor_id: string
          status?: BookingStatus
          service_date: string
          service_details?: string | null
          agreed_price?: number | null
          deposit_paid?: number | null
          deposit_due_date?: string | null
          final_payment_due?: string | null
          notes?: string | null
          contract_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          vendor_id?: string
          status?: BookingStatus
          service_date?: string
          service_details?: string | null
          agreed_price?: number | null
          deposit_paid?: number | null
          deposit_due_date?: string | null
          final_payment_due?: string | null
          notes?: string | null
          contract_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contracts: {
        Row: {
          id: string
          title: string
          description: string | null
          file_url: string
          file_name: string
          file_size: number
          uploaded_at: string
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          file_url: string
          file_name: string
          file_size: number
          uploaded_at?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          file_url?: string
          file_name?: string
          file_size?: number
          uploaded_at?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          vendor_id: string
          rating: number
          title: string | null
          comment: string | null
          reviewer_name: string
          event_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vendor_id: string
          rating: number
          title?: string | null
          comment?: string | null
          reviewer_name: string
          event_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vendor_id?: string
          rating?: number
          title?: string | null
          comment?: string | null
          reviewer_name?: string
          event_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      photos: {
        Row: {
          id: string
          event_id: string
          url: string
          caption: string | null
          category: string | null
          order: number
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          url: string
          caption?: string | null
          category?: string | null
          order?: number
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          url?: string
          caption?: string | null
          category?: string | null
          order?: number
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          content: string
          entity_type: string
          entity_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          entity_type: string
          entity_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          entity_type?: string
          entity_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          subject: string | null
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          subject?: string | null
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          subject?: string | null
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          link?: string | null
          is_read?: boolean
          created_at?: string
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
      user_role: UserRole
      vendor_category: VendorCategory
      booking_status: BookingStatus
      rsvp_status: RSVPStatus
      task_priority: TaskPriority
      task_status: TaskStatus
      expense_status: ExpenseStatus
    }
  }
}
