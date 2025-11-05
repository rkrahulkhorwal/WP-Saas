-- Row Level Security (RLS) Policies for Wedding Planner SaaS
-- This ensures users can only access their own data and public data

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE couple_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE planner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper Functions
-- ============================================================

-- Function to get current user ID from auth
CREATE OR REPLACE FUNCTION auth_user_id() RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL STABLE;

-- Function to check if user owns an event
CREATE OR REPLACE FUNCTION user_owns_event(event_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM events
    WHERE id = event_id AND user_id = auth.uid()
  );
$$ LANGUAGE SQL STABLE;

-- Function to check if user is event collaborator
CREATE OR REPLACE FUNCTION user_is_event_collaborator(event_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM event_collaborators ec
    INNER JOIN users u ON u.email = ec.email
    WHERE ec.event_id = event_id AND u.id = auth.uid() AND ec.accepted_at IS NOT NULL
  );
$$ LANGUAGE SQL STABLE;

-- Function to check if user has access to event (owner or collaborator)
CREATE OR REPLACE FUNCTION user_has_event_access(event_id UUID) RETURNS BOOLEAN AS $$
  SELECT user_owns_event(event_id) OR user_is_event_collaborator(event_id);
$$ LANGUAGE SQL STABLE;

-- ============================================================
-- Users Table Policies
-- ============================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Allow insert during signup (handled by auth trigger)
CREATE POLICY "Allow insert on signup" ON users
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- Profile Tables Policies
-- ============================================================

-- Couple Profiles
CREATE POLICY "Users can view own couple profile" ON couple_profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own couple profile" ON couple_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own couple profile" ON couple_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Planner Profiles
CREATE POLICY "Anyone can view planner profiles" ON planner_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own planner profile" ON planner_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own planner profile" ON planner_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Vendor Profiles
CREATE POLICY "Anyone can view vendor profiles" ON vendor_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own vendor profile" ON vendor_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own vendor profile" ON vendor_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- Events Table Policies
-- ============================================================

-- View events you own or collaborate on, or public events
CREATE POLICY "Users can view accessible events" ON events
  FOR SELECT USING (
    user_id = auth.uid() OR
    user_is_event_collaborator(id) OR
    is_public = true
  );

-- Insert your own events
CREATE POLICY "Users can insert own events" ON events
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Update events you own
CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (user_id = auth.uid());

-- Delete events you own
CREATE POLICY "Users can delete own events" ON events
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- Event Collaborators Policies
-- ============================================================

CREATE POLICY "Users can view collaborators of their events" ON event_collaborators
  FOR SELECT USING (user_has_event_access(event_id));

CREATE POLICY "Event owners can manage collaborators" ON event_collaborators
  FOR ALL USING (user_owns_event(event_id));

-- ============================================================
-- Guests Table Policies
-- ============================================================

-- View guests for events with public RSVP OR events you have access to
CREATE POLICY "Users can view accessible event guests" ON guests
  FOR SELECT USING (
    user_has_event_access(event_id) OR
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND website_enabled = true)
  );

CREATE POLICY "Users can manage guests of their events" ON guests
  FOR ALL USING (user_has_event_access(event_id));

-- Allow public RSVP submission
CREATE POLICY "Anyone can submit RSVP for public events" ON guests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND website_enabled = true)
  );

-- ============================================================
-- Tasks Table Policies
-- ============================================================

CREATE POLICY "Users can view tasks of their events" ON tasks
  FOR SELECT USING (user_has_event_access(event_id) OR assigned_to_id = auth.uid());

CREATE POLICY "Users can manage tasks of their events" ON tasks
  FOR ALL USING (user_has_event_access(event_id));

-- ============================================================
-- Checklist Items Policies
-- ============================================================

CREATE POLICY "Users can view checklist items of their events" ON checklist_items
  FOR SELECT USING (user_has_event_access(event_id));

CREATE POLICY "Users can manage checklist items of their events" ON checklist_items
  FOR ALL USING (user_has_event_access(event_id));

-- ============================================================
-- Timeline Items Policies
-- ============================================================

CREATE POLICY "Users can view timeline items of their events" ON timeline_items
  FOR SELECT USING (
    user_has_event_access(event_id) OR
    EXISTS (SELECT 1 FROM events WHERE id = event_id AND website_enabled = true)
  );

CREATE POLICY "Users can manage timeline items of their events" ON timeline_items
  FOR ALL USING (user_has_event_access(event_id));

-- ============================================================
-- Expenses Table Policies
-- ============================================================

CREATE POLICY "Users can view expenses of their events" ON expenses
  FOR SELECT USING (user_has_event_access(event_id));

CREATE POLICY "Users can manage expenses of their events" ON expenses
  FOR ALL USING (user_has_event_access(event_id));

-- ============================================================
-- Bookings Table Policies
-- ============================================================

CREATE POLICY "Users can view their bookings" ON bookings
  FOR SELECT USING (
    user_has_event_access(event_id) OR
    EXISTS (SELECT 1 FROM vendor_profiles WHERE id = vendor_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can manage bookings of their events" ON bookings
  FOR ALL USING (user_has_event_access(event_id));

-- ============================================================
-- Contracts Table Policies
-- ============================================================

CREATE POLICY "Users can view contracts for their bookings" ON contracts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      INNER JOIN events e ON e.id = b.event_id
      WHERE b.contract_id = contracts.id AND e.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their contracts" ON contracts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM bookings b
      INNER JOIN events e ON e.id = b.event_id
      WHERE b.contract_id = contracts.id AND e.user_id = auth.uid()
    )
  );

-- ============================================================
-- Reviews Table Policies
-- ============================================================

CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert reviews" ON reviews
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- Photos Table Policies
-- ============================================================

CREATE POLICY "Users can view photos of their events or public photos" ON photos
  FOR SELECT USING (
    user_has_event_access(event_id) OR
    (is_public = true AND EXISTS (SELECT 1 FROM events WHERE id = event_id AND website_enabled = true))
  );

CREATE POLICY "Users can manage photos of their events" ON photos
  FOR ALL USING (user_has_event_access(event_id));

-- ============================================================
-- Comments Table Policies
-- ============================================================

CREATE POLICY "Users can view comments on entities they can access" ON comments
  FOR SELECT USING (
    -- Can view own comments
    user_id = auth.uid() OR
    -- Can view comments on events they can access
    (entity_type = 'event' AND user_has_event_access(entity_id::UUID))
  );

CREATE POLICY "Users can insert comments" ON comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================
-- Messages Table Policies
-- ============================================================

CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update messages they received" ON messages
  FOR UPDATE USING (receiver_id = auth.uid());

-- ============================================================
-- Notifications Table Policies
-- ============================================================

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);
