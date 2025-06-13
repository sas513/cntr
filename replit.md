# Watch & Perfume E-commerce Store

## Overview

This is a full-stack e-commerce application for selling watches and perfumes, built with a modern tech stack. The application features a React frontend with TypeScript, an Express.js backend, PostgreSQL database with Drizzle ORM, and includes both customer-facing and admin interfaces. The store is designed for Arabic-speaking customers with bilingual support.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom Arabic typography support
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with middleware for authentication and logging
- **Database**: PostgreSQL with Neon serverless connection
- **ORM**: Drizzle ORM with TypeScript-first schema definitions
- **Authentication**: JWT-based admin authentication
- **External Services**: Telegram Bot API for order notifications

### Deployment Strategy
- **Platform**: Replit with autoscale deployment
- **Build Process**: Vite builds frontend to `dist/public`, esbuild bundles server
- **Database**: Neon PostgreSQL serverless database
- **Environment**: Development and production configurations with proper NODE_ENV handling

## Key Components

### Database Schema
- **Users**: Admin authentication with roles
- **Categories**: Product categorization with Arabic/English names
- **Products**: Detailed product information with multilingual support
- **Cart Items**: Session-based shopping cart
- **Orders**: Customer orders with status tracking
- **Store Settings**: Configurable store parameters
- **Customer Activity**: Analytics and behavior tracking
- **Visitor Stats**: Website traffic monitoring

### Authentication System
- JWT-based admin authentication
- Session-based customer cart management
- Role-based access control for admin features
- Protected admin routes with middleware

### E-commerce Features
- Product catalog with categories and search
- Shopping cart with session persistence
- Order placement and management
- Admin dashboard for inventory and order management
- Customer activity tracking and analytics
- Store configuration management

### UI/UX Design
- Responsive design optimized for mobile and desktop
- Arabic-first design with RTL support
- Dark/light theme support
- Modern component library with consistent styling
- Accessibility features with proper ARIA labels

## Data Flow

### Customer Journey
1. **Product Discovery**: Browse categories, search products, view details
2. **Cart Management**: Add/remove items, update quantities
3. **Order Placement**: Provide customer information, confirm order
4. **Order Tracking**: Receive confirmation, track status updates

### Admin Workflow
1. **Authentication**: Login to admin dashboard
2. **Product Management**: Create, edit, delete products and categories
3. **Order Processing**: View orders, update status, manage fulfillment
4. **Analytics**: Monitor sales, customer activity, and store performance
5. **Configuration**: Manage store settings, telegram notifications

### Data Storage
- **Session Management**: Browser localStorage for cart persistence
- **Database Operations**: CRUD operations through Drizzle ORM
- **File Storage**: Image URLs stored in database (external hosting assumed)
- **Analytics**: Customer activities logged for reporting

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **node-telegram-bot-api**: Telegram notifications

### Development Tools
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production
- **vite**: Frontend build tool and dev server
- **drizzle-kit**: Database migration and schema management

### Authentication & Security
- **jsonwebtoken**: JWT token management
- **bcryptjs**: Password hashing
- **zod**: Runtime type validation

## Deployment Strategy

### Development Environment
- **Command**: `npm run dev` starts both frontend and backend
- **Hot Reload**: Vite HMR for frontend, tsx for backend auto-restart
- **Database**: Connects to Neon PostgreSQL via DATABASE_URL
- **Port**: Application runs on port 5000

### Production Build
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations applied via `npm run db:push`
- **Deployment**: Replit autoscale with proper NODE_ENV=production

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **JWT_SECRET**: Token signing secret (defaults provided for development)
- **NODE_ENV**: Environment flag for production optimizations

## Changelog

```
Changelog:
- June 13, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```