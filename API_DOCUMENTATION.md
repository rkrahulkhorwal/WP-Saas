# Wedding Planner SaaS - API Documentation

Complete API reference for the Wedding Planner SaaS platform.

## Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

### Token Expiration
- Access Token: 15 minutes
- Refresh Token: 7 days

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "COUPLE"
}
```

**Role Options:**
- `COUPLE` - For couples planning their wedding
- `PLANNER` - For professional wedding planners
- `VENDOR` - For vendors (photographers, venues, etc.)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "COUPLE",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Login

Authenticate a user and receive tokens.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### Get Current User

Get authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "COUPLE",
    "coupleProfile": { ... }
  }
}
```

### Refresh Token

Get a new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

## Event Endpoints

### Get All Events

Get all events for the authenticated user.

**Endpoint:** `GET /events`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John & Jane's Wedding",
      "date": "2025-06-15T00:00:00.000Z",
      "venue": "Sunset Garden Estate",
      "budget": 50000,
      "guestCount": 150,
      "_count": {
        "guests": 150,
        "tasks": 25,
        "expenses": 15
      }
    }
  ]
}
```

### Create Event

Create a new wedding event.

**Endpoint:** `POST /events`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John & Jane's Wedding",
  "date": "2025-06-15",
  "time": "4:00 PM",
  "venue": "Sunset Garden Estate",
  "venueAddress": "123 Garden Lane, LA, CA",
  "budget": 50000,
  "guestCount": 150,
  "description": "A beautiful outdoor wedding",
  "partner1Name": "John Doe",
  "partner2Name": "Jane Smith"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": { ... }
}
```

### Get Event Details

Get details of a specific event.

**Endpoint:** `GET /events/{eventId}`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John & Jane's Wedding",
    "date": "2025-06-15T00:00:00.000Z",
    "venue": "Sunset Garden Estate",
    "budget": 50000,
    "websiteSlug": "john-and-jane-2025",
    "websiteEnabled": true,
    "_count": {
      "guests": 150,
      "tasks": 25,
      "expenses": 15,
      "bookings": 5
    }
  }
}
```

### Update Event

Update event details.

**Endpoint:** `PATCH /events/{eventId}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Event Name",
  "budget": 55000,
  "venue": "New Venue"
}
```

**Response:** `200 OK`

### Delete Event

Delete an event and all associated data.

**Endpoint:** `DELETE /events/{eventId}`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Guest Management Endpoints

### Get Guests

Get all guests for an event.

**Endpoint:** `GET /events/{eventId}/guests`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `category` (optional) - Filter by category
- `rsvpStatus` (optional) - Filter by RSVP status

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "guests": [
      {
        "id": "uuid",
        "firstName": "Bob",
        "lastName": "Smith",
        "email": "bob@example.com",
        "category": "Family",
        "rsvpStatus": "ATTENDING",
        "plusOne": true,
        "plusOneName": "Alice Smith"
      }
    ],
    "stats": {
      "total": 150,
      "byStatus": {
        "ATTENDING": 120,
        "NOT_ATTENDING": 10,
        "PENDING": 20
      }
    }
  }
}
```

### Add Guest

Add a new guest to the event.

**Endpoint:** `POST /events/{eventId}/guests`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "Bob",
  "lastName": "Smith",
  "email": "bob@example.com",
  "phone": "+1234567890",
  "category": "Family",
  "plusOne": true,
  "plusOneName": "Alice Smith",
  "dietaryRestrictions": "Vegetarian"
}
```

**Response:** `201 Created`

### Update Guest

Update guest information.

**Endpoint:** `PATCH /events/{eventId}/guests/{guestId}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (All fields optional)
```json
{
  "rsvpStatus": "ATTENDING",
  "tableNumber": 5
}
```

**Response:** `200 OK`

### Delete Guest

Remove a guest from the event.

**Endpoint:** `DELETE /events/{eventId}/guests/{guestId}`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

## Task Management Endpoints

### Get Tasks

Get all tasks for an event.

**Endpoint:** `GET /events/{eventId}/tasks`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional) - Filter by status
- `priority` (optional) - Filter by priority

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Book photographer",
      "description": "Find and book wedding photographer",
      "dueDate": "2025-02-01T00:00:00.000Z",
      "priority": "HIGH",
      "status": "IN_PROGRESS",
      "category": "Photography",
      "assignedTo": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```

### Create Task

Create a new task.

**Endpoint:** `POST /events/{eventId}/tasks`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Book photographer",
  "description": "Find and book wedding photographer",
  "dueDate": "2025-02-01",
  "priority": "HIGH",
  "category": "Photography",
  "assignedToId": "user_uuid"
}
```

**Priority Options:** `LOW`, `MEDIUM`, `HIGH`, `URGENT`

**Response:** `201 Created`

### Update Task

Update task details.

**Endpoint:** `PATCH /tasks/{taskId}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (All fields optional)
```json
{
  "status": "COMPLETED",
  "priority": "MEDIUM"
}
```

**Status Options:** `TODO`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

**Response:** `200 OK`

---

## Budget Management Endpoints

### Get Expenses

Get all expenses for an event with budget summary.

**Endpoint:** `GET /events/{eventId}/expenses`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "expenses": [
      {
        "id": "uuid",
        "name": "Photography",
        "category": "Photography",
        "estimatedCost": 3500,
        "actualCost": 3500,
        "paidAmount": 1000,
        "status": "PENDING",
        "vendor": "Perfect Moments Photography"
      }
    ],
    "summary": {
      "totalEstimated": 45000,
      "totalActual": 42000,
      "totalPaid": 25000,
      "totalBudget": 50000,
      "remaining": 5000
    }
  }
}
```

### Add Expense

Add a new expense.

**Endpoint:** `POST /events/{eventId}/expenses`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Photography Package",
  "category": "Photography",
  "estimatedCost": 3500,
  "actualCost": 3500,
  "paidAmount": 1000,
  "dueDate": "2025-03-01",
  "vendor": "Perfect Moments Photography",
  "notes": "Includes 8 hours coverage"
}
```

**Response:** `201 Created`

### Update Expense

Update expense details.

**Endpoint:** `PATCH /expenses/{expenseId}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (All fields optional)
```json
{
  "paidAmount": 3500,
  "status": "PAID"
}
```

**Status Options:** `PLANNED`, `PAID`, `PENDING`, `OVERDUE`

**Response:** `200 OK`

---

## Vendor Endpoints

### Browse Vendors

Get list of vendors (public endpoint).

**Endpoint:** `GET /vendors`

**Query Parameters:**
- `category` (optional) - Filter by category
- `search` (optional) - Search by name or description
- `minRating` (optional) - Minimum rating filter

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "businessName": "Perfect Moments Photography",
      "category": "PHOTOGRAPHER",
      "description": "Capturing your special moments",
      "serviceArea": ["Los Angeles", "Orange County"],
      "priceRange": "$2,500 - $5,000",
      "rating": 4.9,
      "reviewCount": 78,
      "user": {
        "firstName": "Mike",
        "lastName": "Johnson"
      }
    }
  ]
}
```

**Vendor Categories:**
`VENUE`, `PHOTOGRAPHER`, `VIDEOGRAPHER`, `CATERER`, `FLORIST`, `MUSIC_DJ`, `MUSIC_BAND`, `BAKER`, `DECORATOR`, `MAKEUP_ARTIST`, `HAIR_STYLIST`, `TRANSPORTATION`, `INVITATIONS`, `WEDDING_PLANNER`, `OTHER`

### Get Vendor Details

Get detailed information about a vendor.

**Endpoint:** `GET /vendors/{vendorId}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "businessName": "Perfect Moments Photography",
    "category": "PHOTOGRAPHER",
    "description": "...",
    "portfolio": ["url1", "url2"],
    "rating": 4.9,
    "reviewCount": 78,
    "reviews": [ ... ],
    "user": { ... }
  }
}
```

---

## Booking Endpoints

### Get Bookings

Get all vendor bookings for an event.

**Endpoint:** `GET /events/{eventId}/bookings`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "serviceDate": "2025-06-15T00:00:00.000Z",
      "status": "CONFIRMED",
      "agreedPrice": 3500,
      "depositPaid": 1000,
      "vendor": {
        "businessName": "Perfect Moments Photography",
        "category": "PHOTOGRAPHER"
      }
    }
  ]
}
```

### Create Booking

Create a new vendor booking.

**Endpoint:** `POST /events/{eventId}/bookings`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "vendorId": "vendor_uuid",
  "serviceDate": "2025-06-15",
  "serviceDetails": "8-hour photography coverage",
  "agreedPrice": 3500,
  "depositPaid": 1000,
  "depositDueDate": "2025-03-01",
  "finalPaymentDue": "2025-05-15"
}
```

**Response:** `201 Created`

---

## Timeline & Checklist Endpoints

### Get Timeline

Get day-of timeline for an event.

**Endpoint:** `GET /events/{eventId}/timeline`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Ceremony",
      "description": "Wedding ceremony in the garden",
      "time": "4:00 PM",
      "duration": 30,
      "order": 1
    }
  ]
}
```

### Get Checklist

Get checklist items for an event.

**Endpoint:** `GET /events/{eventId}/checklist`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "grouped": {
      "12+ months before": [ ... ],
      "9-11 months before": [ ... ]
    },
    "stats": {
      "total": 50,
      "completed": 25
    }
  }
}
```

---

## Public RSVP Endpoints

### Get Wedding Website

Get public wedding website details (no auth required).

**Endpoint:** `GET /rsvp/{eventSlug}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John & Jane's Wedding",
    "date": "2025-06-15T00:00:00.000Z",
    "venue": "Sunset Garden Estate",
    "partner1Name": "John",
    "partner2Name": "Jane"
  }
}
```

### Submit RSVP

Submit RSVP response (no auth required).

**Endpoint:** `POST /rsvp/{eventSlug}/submit`

**Request Body:**
```json
{
  "email": "guest@example.com",
  "rsvpStatus": "ATTENDING",
  "dietaryRestrictions": "Vegetarian"
}
```

**RSVP Status Options:** `ATTENDING`, `NOT_ATTENDING`, `MAYBE`

**Response:** `200 OK`

---

## Error Responses

All endpoints return standard error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [ ... ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "An error occurred"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding rate limiting middleware.

## CORS

CORS is configured to accept requests from the frontend application. Update `next.config.js` for custom CORS settings.

---

**API Version:** 1.0.0
**Last Updated:** 2024
