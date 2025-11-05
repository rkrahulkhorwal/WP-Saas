# Wedding Planner SaaS Platform

A comprehensive, production-ready Wedding Planner SaaS platform that helps couples, wedding planners, and vendors collaboratively manage every aspect of a wedding—from engagement to the big day.

## 🌟 Features

### Core Modules

- **🎉 Event Management** - Create and manage multiple wedding events with detailed information
- **👥 Guest List & RSVP Management** - Manage guest lists, track RSVPs, dietary restrictions, and seating
- **✅ Task & Checklist Management** - Stay organized with customizable checklists and task assignments
- **💰 Budget Planner** - Track expenses, manage payments, and monitor budget in real-time
- **🏪 Vendor Directory & Booking** - Discover and book trusted vendors (photographers, venues, caterers, etc.)
- **📋 Contract Management** - Store and manage vendor contracts and agreements
- **📅 Timeline Tracking** - Create detailed day-of timelines with time slots and activities
- **🌐 Wedding Website Builder** - Generate beautiful, public-facing wedding websites with RSVP functionality

### User Roles

1. **Couples** - DIY wedding planning with full access to all planning tools
2. **Professional Wedding Planners** - Manage multiple client events and collaborate with couples
3. **Vendors** - Showcase services, manage bookings, and grow business

### Technical Features

- **Authentication & Authorization** - JWT-based auth with role-based access control
- **RESTful API** - Well-structured API endpoints for all operations
- **Responsive Design** - Mobile-first design that works on all devices
- **Real-time Updates** - Collaborative features with instant updates
- **Data Validation** - Comprehensive input validation using Zod
- **Type Safety** - Full TypeScript implementation
- **Database** - PostgreSQL with Prisma ORM
- **Modern UI** - Built with Next.js 14, React, and Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WP-Saas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/wedding_planner"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_SECRET="your-super-secret-refresh-key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev

   # Seed the database (optional - adds demo data)
   npm run prisma:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Credentials

After seeding the database, you can log in with:

- **Couple**: `couple@example.com` / `password123`
- **Planner**: `planner@example.com` / `password123`
- **Photographer**: `photographer@example.com` / `password123`
- **Venue**: `venue@example.com` / `password123`

## 📁 Project Structure

```
WP-Saas/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected dashboard pages
│   │   └── dashboard/
│   │       ├── events/
│   │       ├── guests/
│   │       ├── tasks/
│   │       ├── budget/
│   │       ├── vendors/
│   │       └── website/
│   ├── api/                 # API routes
│   │   ├── auth/
│   │   ├── events/
│   │   ├── vendors/
│   │   ├── tasks/
│   │   ├── expenses/
│   │   └── rsvp/
│   ├── w/[slug]/           # Public wedding websites
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── ui/                  # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Card.tsx
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # Authentication utilities
│   ├── validators.ts       # Zod schemas
│   ├── middleware.ts       # API middleware
│   └── api-response.ts     # Response helpers
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Database seeder
├── public/                  # Static assets
├── types/                   # TypeScript types
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## 🗄️ Database Schema

The platform uses PostgreSQL with the following main entities:

- **User** - User accounts with role-based access
- **CoupleProfile** - Extended profile for couples
- **PlannerProfile** - Extended profile for planners
- **VendorProfile** - Extended profile for vendors
- **Event** - Wedding events
- **Guest** - Guest list entries
- **Task** - Tasks and to-dos
- **ChecklistItem** - Checklist items
- **TimelineItem** - Day-of timeline items
- **Expense** - Budget expenses
- **Booking** - Vendor bookings
- **Contract** - Contract documents
- **Review** - Vendor reviews
- **Photo** - Photo gallery
- **Notification** - User notifications
- **Message** - In-app messaging

## 🔌 API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "COUPLE"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

### Events

#### Get All Events
```http
GET /api/events
Authorization: Bearer <access_token>
```

#### Create Event
```http
POST /api/events
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "John & Jane's Wedding",
  "date": "2025-06-15",
  "venue": "Sunset Garden Estate",
  "budget": 50000,
  "guestCount": 150
}
```

#### Get Event Details
```http
GET /api/events/{eventId}
Authorization: Bearer <access_token>
```

#### Update Event
```http
PATCH /api/events/{eventId}
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "budget": 55000
}
```

#### Delete Event
```http
DELETE /api/events/{eventId}
Authorization: Bearer <access_token>
```

### Guest Management

#### Get Guests
```http
GET /api/events/{eventId}/guests
Authorization: Bearer <access_token>
```

#### Add Guest
```http
POST /api/events/{eventId}/guests
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "Bob",
  "lastName": "Smith",
  "email": "bob@example.com",
  "plusOne": true
}
```

#### Update Guest
```http
PATCH /api/events/{eventId}/guests/{guestId}
Authorization: Bearer <access_token>
```

### Tasks

#### Get Tasks
```http
GET /api/events/{eventId}/tasks
Authorization: Bearer <access_token>
```

#### Create Task
```http
POST /api/events/{eventId}/tasks
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Book photographer",
  "dueDate": "2025-02-01",
  "priority": "HIGH"
}
```

### Budget

#### Get Expenses
```http
GET /api/events/{eventId}/expenses
Authorization: Bearer <access_token>
```

#### Add Expense
```http
POST /api/events/{eventId}/expenses
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Photography",
  "category": "Photography",
  "estimatedCost": 3500
}
```

### Vendors

#### Browse Vendors
```http
GET /api/vendors?category=PHOTOGRAPHER
```

#### Get Vendor Details
```http
GET /api/vendors/{vendorId}
```

### Public RSVP

#### Get Wedding Website
```http
GET /api/rsvp/{eventSlug}
```

#### Submit RSVP
```http
POST /api/rsvp/{eventSlug}/submit
Content-Type: application/json

{
  "email": "guest@example.com",
  "rsvpStatus": "ATTENDING",
  "dietaryRestrictions": "Vegetarian"
}
```

## 🛠️ Built With

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Tailwind CSS** - Styling
- **Zod** - Schema validation
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **react-hook-form** - Form handling
- **react-hot-toast** - Notifications
- **Lucide React** - Icons
- **date-fns** - Date manipulation

## 🚢 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure all environment variables are properly set:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="<strong-secret>"
JWT_REFRESH_SECRET="<strong-secret>"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

### Recommended Hosting Platforms

- **Vercel** - Optimized for Next.js
- **Railway** - Easy PostgreSQL hosting
- **Render** - Full-stack deployment
- **AWS** / **Google Cloud** / **Azure** - Enterprise solutions

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed database with demo data

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation on all endpoints
- SQL injection protection via Prisma
- XSS protection
- CORS configuration
- Secure HTTP-only cookies option

## 🎨 Customization

### Changing Theme Colors

Edit `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: 'your-color',
      // ...
    },
  },
}
```

### Adding Custom Features

1. Create new API routes in `app/api/`
2. Add database models in `prisma/schema.prisma`
3. Run migrations: `npx prisma migrate dev`
4. Create UI components in `components/`
5. Add pages in `app/(dashboard)/dashboard/`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review API documentation above

## 🎉 Acknowledgments

- Built with modern web technologies
- Designed for real-world wedding planning needs
- Inspired by leading wedding planning platforms

---

**Made with ❤️ for couples, planners, and vendors everywhere**
