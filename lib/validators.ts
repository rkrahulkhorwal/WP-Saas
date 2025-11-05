import { z } from 'zod';

// Auth validators
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['COUPLE', 'PLANNER', 'VENDOR']),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Event validators
export const createEventSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  type: z.string().default('Wedding'),
  date: z.string().or(z.date()),
  time: z.string().optional(),
  venue: z.string().optional(),
  venueAddress: z.string().optional(),
  budget: z.number().positive().optional(),
  guestCount: z.number().int().positive().optional(),
  description: z.string().optional(),
  partner1Name: z.string().optional(),
  partner2Name: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

// Guest validators
export const createGuestSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  category: z.string().optional(),
  plusOne: z.boolean().default(false),
  plusOneName: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  notes: z.string().optional(),
});

export const updateGuestSchema = createGuestSchema.partial();

export const rsvpSchema = z.object({
  rsvpStatus: z.enum(['ATTENDING', 'NOT_ATTENDING', 'MAYBE']),
  dietaryRestrictions: z.string().optional(),
});

// Task validators
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  dueDate: z.string().or(z.date()).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  category: z.string().optional(),
  assignedToId: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

// Expense validators
export const createExpenseSchema = z.object({
  name: z.string().min(1, 'Expense name is required'),
  category: z.string().min(1, 'Category is required'),
  estimatedCost: z.number().positive('Estimated cost must be positive'),
  actualCost: z.number().positive().optional(),
  paidAmount: z.number().min(0).default(0),
  dueDate: z.string().or(z.date()).optional(),
  vendor: z.string().optional(),
  notes: z.string().optional(),
});

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  status: z.enum(['PLANNED', 'PAID', 'PENDING', 'OVERDUE']).optional(),
});

// Vendor Profile validators
export const createVendorProfileSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  category: z.enum([
    'VENUE',
    'PHOTOGRAPHER',
    'VIDEOGRAPHER',
    'CATERER',
    'FLORIST',
    'MUSIC_DJ',
    'MUSIC_BAND',
    'BAKER',
    'DECORATOR',
    'MAKEUP_ARTIST',
    'HAIR_STYLIST',
    'TRANSPORTATION',
    'INVITATIONS',
    'WEDDING_PLANNER',
    'OTHER',
  ]),
  description: z.string().optional(),
  serviceArea: z.array(z.string()).default([]),
  priceRange: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
});

export const updateVendorProfileSchema = createVendorProfileSchema.partial();

// Booking validators
export const createBookingSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  serviceDate: z.string().or(z.date()),
  serviceDetails: z.string().optional(),
  agreedPrice: z.number().positive().optional(),
  depositPaid: z.number().min(0).optional(),
  depositDueDate: z.string().or(z.date()).optional(),
  finalPaymentDue: z.string().or(z.date()).optional(),
  notes: z.string().optional(),
});

export const updateBookingSchema = createBookingSchema.partial().extend({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
});

// Checklist validators
export const createChecklistItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().optional(),
  order: z.number().int().default(0),
});

export const updateChecklistItemSchema = createChecklistItemSchema.partial().extend({
  isCompleted: z.boolean().optional(),
});

// Timeline validators
export const createTimelineItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  time: z.string().min(1, 'Time is required'),
  duration: z.number().int().positive().optional(),
  order: z.number().int().default(0),
});

export const updateTimelineItemSchema = createTimelineItemSchema.partial();

// Wedding Website validators
export const updateWeddingWebsiteSchema = z.object({
  websiteSlug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed').optional(),
  websiteTheme: z.string().optional(),
  websiteEnabled: z.boolean().optional(),
  coupleStory: z.string().optional(),
  partner1Name: z.string().optional(),
  partner2Name: z.string().optional(),
});
