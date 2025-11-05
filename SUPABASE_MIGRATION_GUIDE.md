# Supabase Migration Guide

## Overview

This document provides a comprehensive guide for completing the migration from Prisma + JWT to Supabase for the Wedding Planner SaaS application.

## Migration Status

### ✅ Completed

1. **Dependencies & Configuration**
   - Installed `@supabase/supabase-js` and `@supabase/ssr`
   - Updated `.env.example` with Supabase configuration
   - Created middleware for Supabase session management

2. **Database Schema**
   - Created SQL migration files in `supabase/migrations/`:
     - `20250101000000_initial_schema.sql` - All tables, enums, indexes
     - `20250101000001_rls_policies.sql` - Row Level Security policies
     - `20250101000002_auth_triggers.sql` - Auth sync triggers

3. **Supabase Client Utilities**
   - `lib/supabase/server.ts` - Server-side Supabase client
   - `lib/supabase/client.ts` - Client-side Supabase client
   - `lib/supabase/middleware.ts` - Session management middleware
   - `lib/supabase/types.ts` - TypeScript type definitions
   - `lib/supabase/api-helpers.ts` - API response helpers and auth functions

4. **Authentication Routes (100% Complete)**
   - ✅ `/api/auth/register` - Supabase Auth signup
   - ✅ `/api/auth/login` - Supabase Auth signin
   - ✅ `/api/auth/me` - Get/update user profile
   - ✅ `/api/auth/refresh` - Refresh session
   - ✅ `/api/auth/logout` - Sign out

5. **Events Routes (Partially Complete)**
   - ✅ `/api/events` - List and create events
   - ✅ `/api/events/[id]` - Get, update, delete event
   - ⏳ Remaining event sub-routes need migration

### ⏳ Remaining Work

The following API routes still need to be migrated from Prisma to Supabase. Follow the pattern established in the completed routes.

## Migration Pattern

### 1. Import Updates

**Old (Prisma):**
```typescript
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/api-response';
import { requireAuth } from '@/lib/middleware';
```

**New (Supabase):**
```typescript
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, requireAuth, validateRequest, checkEventAccess } from '@/lib/supabase/api-helpers';
```

### 2. Authentication

**Old (Prisma):**
```typescript
const authResult = await requireAuth(request);
if (!authResult.success) {
  return authResult.response;
}
const userId = authResult.user.userId;
```

**New (Supabase):**
```typescript
const { user, error: authError } = await requireAuth();
if (authError) {
  return authError;
}
const userId = user!.id;
```

### 3. Database Queries

**Read Operations:**
```typescript
// Old (Prisma)
const items = await prisma.tableName.findMany({
  where: { userId: userId },
  include: { relatedTable: true },
});

// New (Supabase)
const supabase = createClient();
const { data: items, error } = await supabase
  .from('table_name')
  .select('*, related_table(*)')
  .eq('user_id', userId);
```

**Create Operations:**
```typescript
// Old (Prisma)
const item = await prisma.tableName.create({
  data: {
    userId: userId,
    fieldName: value
  },
});

// New (Supabase)
const { data: item, error } = await supabase
  .from('table_name')
  .insert({
    user_id: userId,
    field_name: value
  })
  .select()
  .single();
```

**Update Operations:**
```typescript
// Old (Prisma)
const item = await prisma.tableName.update({
  where: { id: itemId },
  data: { fieldName: newValue },
});

// New (Supabase)
const { data: item, error } = await supabase
  .from('table_name')
  .update({ field_name: newValue })
  .eq('id', itemId)
  .select()
  .single();
```

**Delete Operations:**
```typescript
// Old (Prisma)
await prisma.tableName.delete({
  where: { id: itemId },
});

// New (Supabase)
const { error } = await supabase
  .from('table_name')
  .delete()
  .eq('id', itemId);
```

### 4. Field Name Conversion

Prisma uses camelCase, Supabase uses snake_case:

| Prisma Field | Supabase Field |
|--------------|----------------|
| `userId` | `user_id` |
| `eventId` | `event_id` |
| `firstName` | `first_name` |
| `lastName` | `last_name` |
| `guestCount` | `guest_count` |
| `websiteSlug` | `website_slug` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |

### 5. Counting Related Records

**Old (Prisma):**
```typescript
const event = await prisma.event.findUnique({
  where: { id: eventId },
  include: {
    _count: {
      select: {
        guests: true,
        tasks: true,
      },
    },
  },
});
```

**New (Supabase):**
```typescript
const { data: event } = await supabase
  .from('events')
  .select('*')
  .eq('id', eventId)
  .single();

const [guestsCount, tasksCount] = await Promise.all([
  supabase.from('guests').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
  supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('event_id', eventId),
]);

const eventWithCounts = {
  ...event,
  _count: {
    guests: guestsCount.count || 0,
    tasks: tasksCount.count || 0,
  },
};
```

## Routes That Need Migration

### Guests Routes
- `/api/events/[id]/guests/route.ts` - List and create guests
- `/api/events/[id]/guests/[guestId]/route.ts` - Get, update, delete guest

### Tasks Routes
- `/api/events/[id]/tasks/route.ts` - List and create tasks
- `/api/tasks/[taskId]/route.ts` - Update and delete task

### Expenses Routes
- `/api/events/[id]/expenses/route.ts` - List and create expenses
- `/api/expenses/[expenseId]/route.ts` - Update and delete expense

### Vendors Routes
- `/api/vendors/route.ts` - Browse vendors
- `/api/vendors/[id]/route.ts` - Get vendor details

### Bookings Routes
- `/api/events/[id]/bookings/route.ts` - List and create bookings

### Checklist Routes
- `/api/events/[id]/checklist/route.ts` - List and create checklist items

### Timeline Routes
- `/api/events/[id]/timeline/route.ts` - List and create timeline items

### RSVP Routes
- `/api/rsvp/[eventSlug]/route.ts` - Get wedding website
- `/api/rsvp/[eventSlug]/submit/route.ts` - Submit RSVP

## Database Setup Instructions

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create a new project
   - Note your project URL and anon key

2. **Set Environment Variables**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

3. **Run Migrations**

   Option A: Using Supabase CLI (recommended)
   ```bash
   npx supabase link --project-ref your-project-ref
   npx supabase db push
   ```

   Option B: Using Supabase Dashboard
   - Go to SQL Editor in your Supabase dashboard
   - Run each migration file in order:
     1. `supabase/migrations/20250101000000_initial_schema.sql`
     2. `supabase/migrations/20250101000001_rls_policies.sql`
     3. `supabase/migrations/20250101000002_auth_triggers.sql`

4. **Configure Authentication**
   - Go to Authentication > Providers in Supabase Dashboard
   - Enable Email provider
   - Configure email templates if needed

## Testing Checklist

After completing migration:

- [ ] User registration works
- [ ] User login works
- [ ] User profile retrieval works
- [ ] User profile update works
- [ ] Event creation works
- [ ] Event listing works
- [ ] Event update works
- [ ] Event deletion works
- [ ] Guest management works
- [ ] Task management works
- [ ] Expense tracking works
- [ ] Vendor browsing works
- [ ] Booking creation works
- [ ] RSVP submission works
- [ ] RLS policies prevent unauthorized access
- [ ] Session refresh works
- [ ] Logout works

## Cleanup After Migration

Once all routes are migrated and tested:

1. **Remove Prisma**
   ```bash
   npm uninstall @prisma/client prisma
   ```

2. **Remove JWT Dependencies**
   ```bash
   npm uninstall jsonwebtoken bcryptjs @types/jsonwebtoken @types/bcryptjs
   ```

3. **Remove Old Files**
   ```bash
   rm -rf prisma/
   rm lib/prisma.ts
   rm lib/auth.ts
   rm lib/middleware.ts
   rm lib/api-response.ts
   ```

4. **Update package.json**
   - Remove `postinstall` script
   - Remove prisma-related scripts

## Important Notes

1. **RLS Policies**: Supabase uses Row Level Security (RLS) to secure data. Our policies are configured to:
   - Allow users to see only their own data
   - Allow public access to vendor profiles and public RSVP pages
   - Enforce event ownership and collaboration permissions

2. **Auth Triggers**: We have triggers that sync Supabase Auth users with our custom users table. This maintains compatibility with the existing data model.

3. **Type Safety**: The `Database` type in `lib/supabase/types.ts` provides full TypeScript support for all database operations.

4. **Session Management**: The middleware in `middleware.ts` automatically refreshes user sessions on each request.

## Support

If you encounter issues during migration:

1. Check Supabase logs in the dashboard
2. Verify RLS policies are correctly applied
3. Ensure environment variables are set
4. Check that migrations ran successfully

## Next Steps

1. Complete migration of remaining API routes following the patterns above
2. Update frontend authentication to use Supabase session
3. Test thoroughly
4. Remove Prisma dependencies
5. Deploy to production
