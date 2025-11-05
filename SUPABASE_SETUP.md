# Supabase Setup - Quick Start Guide

## What's Been Done

The Wedding Planner SaaS backend has been partially migrated to Supabase. Here's what's ready:

### ✅ Complete
- **Database Schema**: All tables, enums, relationships defined in SQL
- **Row Level Security (RLS)**: Comprehensive security policies
- **Authentication System**: Full Supabase Auth integration
- **API Routes**: Auth routes and main events routes migrated
- **Utilities**: Complete Supabase client and helper functions

### ⏳ In Progress
- Other API routes (guests, tasks, expenses, vendors, etc.) need migration
- See `SUPABASE_MIGRATION_GUIDE.md` for detailed instructions

## Setup Steps

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name: `wedding-planner-saas`
   - Database password: (generate a strong password)
   - Region: (choose closest to you)
5. Wait for project to be created (~2 minutes)

### 2. Get Your Credentials

Once your project is created:

1. Go to **Project Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (labeled "anon public")
   - **service_role key**: `eyJhbGc...` (labeled "service_role")

### 3. Configure Environment Variables

Create `.env.local` file in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@weddingplanner.com

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./public/uploads
```

### 4. Run Database Migrations

**Option A: Using Supabase Dashboard (Easiest)**

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New query**
3. Copy and paste the content of each migration file:
   - First: `supabase/migrations/20250101000000_initial_schema.sql`
   - Second: `supabase/migrations/20250101000001_rls_policies.sql`
   - Third: `supabase/migrations/20250101000002_auth_triggers.sql`
4. Run each migration (press `RUN` button)

**Option B: Using Supabase CLI**

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
npx supabase login

# Link to your project
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push
```

### 5. Configure Authentication

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Enable **Email** provider (should be enabled by default)
3. Configure email settings:
   - Go to **Authentication** → **Email Templates**
   - Customize templates if needed

4. (Optional) Configure other providers:
   - Google OAuth
   - GitHub OAuth
   - etc.

### 6. Install Dependencies

```bash
npm install
```

### 7. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Verify Setup

### Test Authentication

1. Go to `http://localhost:3000/register`
2. Create a new account
3. Check Supabase dashboard → **Authentication** → **Users**
4. You should see your new user

### Test Database

1. Go to Supabase dashboard → **Table Editor**
2. You should see all tables:
   - users
   - events
   - guests
   - tasks
   - expenses
   - vendors
   - etc.

### Check RLS Policies

1. Go to Supabase dashboard → **Authentication** → **Policies**
2. Each table should have multiple policies
3. Example for `events` table:
   - "Users can view accessible events"
   - "Users can insert own events"
   - "Users can update own events"
   - "Users can delete own events"

## What Works Now

✅ **User Registration**: Create account with email/password
✅ **User Login**: Sign in with email/password
✅ **User Profile**: View and update profile
✅ **Session Management**: Automatic session refresh
✅ **Events**: Create, list, view, update, delete events
✅ **Security**: Row Level Security enforced

## What Needs Work

⏳ **Remaining API Routes**: Follow patterns in `SUPABASE_MIGRATION_GUIDE.md` to migrate:
- Guests management
- Tasks management
- Expenses tracking
- Vendor browsing
- Bookings
- Timeline & Checklist
- RSVP functionality

## Troubleshooting

### "Invalid API key" error
- Double-check your environment variables
- Make sure you're using the correct project URL and keys
- Restart dev server after changing .env.local

### "relation does not exist" error
- Migrations haven't been run
- Go back to Step 4 and run migrations

### "row level security policy violation" error
- RLS policies not applied
- Run the RLS migration (`20250101000001_rls_policies.sql`)

### Authentication not working
- Check that Email provider is enabled in Supabase
- Verify NEXT_PUBLIC_SUPABASE_URL is correct
- Check browser console for errors

## Next Steps

1. ✅ Setup complete - backend is partially functional
2. Follow `SUPABASE_MIGRATION_GUIDE.md` to migrate remaining routes
3. Update frontend to use Supabase session/auth
4. Test thoroughly
5. Deploy to production

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- Migration Guide: `SUPABASE_MIGRATION_GUIDE.md`
