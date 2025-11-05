-- Wedding Planner SaaS Database Schema for Supabase
-- This migration creates all tables, enums, indexes, and relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enums
CREATE TYPE user_role AS ENUM ('COUPLE', 'PLANNER', 'VENDOR', 'ADMIN');
CREATE TYPE vendor_category AS ENUM (
  'VENUE', 'PHOTOGRAPHER', 'VIDEOGRAPHER', 'CATERER', 'FLORIST',
  'MUSIC_DJ', 'MUSIC_BAND', 'BAKER', 'DECORATOR', 'MAKEUP_ARTIST',
  'HAIR_STYLIST', 'TRANSPORTATION', 'INVITATIONS', 'WEDDING_PLANNER', 'OTHER'
);
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
CREATE TYPE rsvp_status AS ENUM ('PENDING', 'ATTENDING', 'NOT_ATTENDING', 'MAYBE');
CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE task_status AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE expense_status AS ENUM ('PLANNED', 'PAID', 'PENDING', 'OVERDUE');

-- ============================================================
-- Core User Tables
-- ============================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  role user_role DEFAULT 'COUPLE' NOT NULL,
  avatar TEXT,
  is_verified BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_users_email ON users(email);

-- Couple Profile
CREATE TABLE couple_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_name TEXT,
  wedding_date TIMESTAMPTZ,
  budget DECIMAL(10, 2),
  guest_count INTEGER,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Planner Profile
CREATE TABLE planner_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company TEXT,
  bio TEXT,
  years_experience INTEGER,
  portfolio TEXT[],
  certifications TEXT[],
  rating DECIMAL(3, 2) DEFAULT 0 NOT NULL,
  review_count INTEGER DEFAULT 0 NOT NULL,
  price_range TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Vendor Profile
CREATE TABLE vendor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  category vendor_category NOT NULL,
  description TEXT,
  service_area TEXT[],
  portfolio TEXT[],
  price_range TEXT,
  rating DECIMAL(3, 2) DEFAULT 0 NOT NULL,
  review_count INTEGER DEFAULT 0 NOT NULL,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- Event Management
-- ============================================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  planner_id UUID REFERENCES planner_profiles(id),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Wedding' NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  time TEXT,
  venue TEXT,
  venue_address TEXT,
  budget DECIMAL(10, 2),
  guest_count INTEGER,
  description TEXT,

  -- Wedding Website Settings
  website_slug TEXT UNIQUE,
  website_theme TEXT DEFAULT 'classic' NOT NULL,
  website_enabled BOOLEAN DEFAULT false NOT NULL,
  couple_story TEXT,
  couple_photo TEXT,
  partner1_name TEXT,
  partner2_name TEXT,

  is_public BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_website_slug ON events(website_slug);

-- Event Collaborators
CREATE TABLE event_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'viewer' NOT NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  accepted_at TIMESTAMPTZ,

  UNIQUE(event_id, email)
);

CREATE INDEX idx_event_collaborators_event_id ON event_collaborators(event_id);

-- ============================================================
-- Guest Management
-- ============================================================

CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  category TEXT,
  plus_one BOOLEAN DEFAULT false NOT NULL,
  plus_one_name TEXT,
  rsvp_status rsvp_status DEFAULT 'PENDING' NOT NULL,
  rsvp_date TIMESTAMPTZ,
  dietary_restrictions TEXT,
  table_number INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_guests_event_id ON guests(event_id);
CREATE INDEX idx_guests_email ON guests(email);

-- ============================================================
-- Task Management
-- ============================================================

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  assigned_to_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  priority task_priority DEFAULT 'MEDIUM' NOT NULL,
  status task_status DEFAULT 'TODO' NOT NULL,
  category TEXT,
  "order" INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_tasks_event_id ON tasks(event_id);
CREATE INDEX idx_tasks_assigned_to_id ON tasks(assigned_to_id);

-- Checklist Items
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  "order" INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_checklist_items_event_id ON checklist_items(event_id);

-- Timeline Items
CREATE TABLE timeline_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time TEXT NOT NULL,
  duration INTEGER,
  "order" INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_timeline_items_event_id ON timeline_items(event_id);

-- ============================================================
-- Budget & Expenses
-- ============================================================

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  estimated_cost DECIMAL(10, 2) NOT NULL,
  actual_cost DECIMAL(10, 2),
  paid_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL,
  status expense_status DEFAULT 'PLANNED' NOT NULL,
  due_date TIMESTAMPTZ,
  paid_date TIMESTAMPTZ,
  vendor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_expenses_event_id ON expenses(event_id);

-- ============================================================
-- Vendor Bookings & Contracts
-- ============================================================

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendor_profiles(id),
  status booking_status DEFAULT 'PENDING' NOT NULL,
  service_date TIMESTAMPTZ NOT NULL,
  service_details TEXT,
  agreed_price DECIMAL(10, 2),
  deposit_paid DECIMAL(10, 2),
  deposit_due_date TIMESTAMPTZ,
  final_payment_due TIMESTAMPTZ,
  notes TEXT,
  contract_id UUID REFERENCES contracts(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_bookings_vendor_id ON bookings(vendor_id);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  reviewer_name TEXT NOT NULL,
  event_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_reviews_vendor_id ON reviews(vendor_id);

-- ============================================================
-- Media & Content
-- ============================================================

CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  caption TEXT,
  category TEXT,
  "order" INTEGER DEFAULT 0 NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_photos_event_id ON photos(event_id);

-- ============================================================
-- Communication
-- ============================================================

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- ============================================================
-- Triggers for updated_at timestamps
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_couple_profiles_updated_at BEFORE UPDATE ON couple_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_planner_profiles_updated_at BEFORE UPDATE ON planner_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendor_profiles_updated_at BEFORE UPDATE ON vendor_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON checklist_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_timeline_items_updated_at BEFORE UPDATE ON timeline_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
