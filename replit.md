# Sarkari Result Portal

## Overview

A government job portal website built in the style of Sarkari Result websites. The application serves as an information hub for government job notifications, admit cards, exam results, and answer keys across India. It features a public-facing portal for job seekers and an admin panel for content management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS v4 with shadcn/ui component library (New York style)
- **Build Tool**: Vite with custom plugins for meta images and Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ESM modules)
- **Session Management**: express-session with MemoryStore
- **Authentication**: Simple username/password admin auth stored in environment variables (ADMIN_USERNAME, ADMIN_PASSWORD)

### Database Layer
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Drizzle Kit with `db:push` command

### Data Models
The main entity is `posts` which stores all content types:
- Jobs, Admit Cards, Results, Answer Keys, Admissions
- Contains structured JSON fields for: vacancy details, application fees, important dates, age limits, selection process, physical eligibility, and links
- **HTML Paste Fields**: 8 section-based HTML content fields (importantDatesHtml, applicationFeeHtml, ageLimitHtml, vacancyDetailsHtml, physicalStandardHtml, physicalEfficiencyHtml, selectionProcessHtml, importantLinksHtml) for direct copy-paste from Sarkari Result or official notifications
- Supports SEO slugs, featured/trending flags, and type-specific URLs

### Admin Features
- **Secret Admin Access**: Admin panel accessible only via direct /admin URL (no public links)
- **Dual Parser System**: Rule-based parser (fast, no external calls) + AI parser (for complex notifications)
- **HTML Paste Support**: Admins can copy-paste HTML tables/content directly from official sources
- **Analytics Dashboard**: Tracks page views, visitors, and top posts
- **Sarkari Result Styling**: Content boxes use maroon (#800000) and dark green (#006400) heading strips

### API Structure
RESTful API with these endpoints:
- `POST /api/auth/login` - Admin authentication
- `POST /api/auth/logout` - Session termination
- `GET /api/auth/check` - Auth status verification
- `GET /api/posts` - List all posts
- `POST /api/posts` - Create post (auth required)
- `PUT /api/posts/:id` - Update post (auth required)
- `DELETE /api/posts/:id` - Delete post (auth required)

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components including shadcn/ui
    pages/        # Route components
    lib/          # Utilities, hooks, data types
    hooks/        # Custom React hooks
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Database operations
  db.ts           # Database connection
shared/           # Shared code between client/server
  schema.ts       # Drizzle database schema
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### UI Components
- **shadcn/ui**: Complete component library built on Radix UI primitives
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)
- **Lucide React**: Icon library

### Session & Auth
- **express-session**: Server-side session management
- **memorystore**: In-memory session storage (suitable for single-instance deployments)

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret for session encryption (defaults to fallback value)
- `ADMIN_USERNAME`: Admin login username (defaults to 'admin')
- `ADMIN_PASSWORD`: Admin login password (defaults to 'admin123')