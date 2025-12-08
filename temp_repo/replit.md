# SEO Automation Hub

## Overview

This is a comprehensive SEO automation platform built for content management and publishing, specifically tailored for legal content marketing (e.g., personal injury law firms). The application enables users to create, analyze, optimize, and publish SEO-optimized content to WordPress sites. It features AI-powered content generation, SEO analysis tools, campaign management, geo-targeting capabilities, and integration with popular WordPress plugins like Yoast SEO and Jetpack.

The platform is designed to be embedded into WordPress admin panels while maintaining its own standalone interface, providing a seamless experience for content managers and SEO professionals.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Wouter (lightweight client-side routing library) handles navigation between pages without requiring a full framework like Next.js.

**UI Component Library**: Radix UI primitives with shadcn/ui styling system. The project uses the "new-york" style variant with Tailwind CSS for styling. All components follow a consistent design system with customizable CSS variables for theming.

**State Management**: TanStack Query (React Query) for server state management. Query invalidation and caching strategies are configured globally with disabled automatic refetching to reduce unnecessary API calls.

**Form Handling**: React Hook Form with Zod resolvers for type-safe form validation.

**Styling Approach**: Tailwind CSS with custom design tokens. The application uses CSS variables for theming (light/dark mode support) and utility-first classes. Custom Tailwind plugins are configured for animations and extended color palettes.

**Component Structure**: 
- `client/src/pages/` - Page-level components for each route
- `client/src/components/` - Shared UI components
- `client/src/components/ui/` - Base UI primitives from shadcn/ui
- Centralized sidebar navigation component for consistent layout across pages

**Key Design Patterns**:
- Compound component pattern for complex UI elements
- Render props and custom hooks for logic reuse
- Controlled vs uncontrolled components based on use case

### Backend Architecture

**Framework**: Express.js running on Node.js with TypeScript.

**API Design**: RESTful API architecture with endpoints organized by feature domain (campaigns, content, users). The server uses conventional HTTP methods and status codes.

**Middleware Stack**:
- JSON body parsing with raw body preservation for webhook validation
- URL-encoded form data support
- Custom request logging middleware tracking response times and status codes
- CORS handling for cross-origin requests

**Development vs Production**:
- Development mode uses Vite's middleware mode for HMR (Hot Module Replacement)
- Production serves pre-built static files from `dist/public`
- Environment-specific configuration via `NODE_ENV`

**Build Process**: Custom esbuild configuration that bundles server code with selective dependency bundling (allowlist approach) to optimize cold start times. Client built separately with Vite.

**Static File Serving**: Express static middleware serves the built React application. All non-API routes fall through to `index.html` for client-side routing.

### Database & ORM

**Database**: PostgreSQL (configured via Drizzle Kit with connection string from environment variable `DATABASE_URL`).

**ORM**: Drizzle ORM for type-safe database queries and schema management.

**Schema Design** (`shared/schema.ts`):
- `users` - User authentication and profile data with UUID primary keys
- `campaigns` - SEO campaigns with blog URLs, embed codes, status tracking
- `generatedContent` - AI-generated articles with SEO metadata, publishing status, and scheduling
- `contentHistory` - Version control for content changes
- `monthlyContentQuota` - Usage tracking for content generation limits
- `apiKeys` - Secure storage of third-party API credentials

**Schema Validation**: Drizzle-Zod integration provides runtime validation schemas matching database schema definitions.

**Migration Strategy**: Schema changes managed through `drizzle-kit push` command. Migration files stored in `./migrations` directory.

### Authentication & Authorization

**Pattern**: Session-based authentication expected (infrastructure present for user ID extraction from requests).

**User Identification**: Helper function `getUserId()` extracts user ID from request object, defaulting to "default-user" for development/testing.

**Security Considerations**: User table includes hashed passwords (not plaintext). The application expects integration with Passport.js or similar (dependencies installed but implementation not shown in provided files).

### AI Content Generation

**Providers Supported**:
- OpenAI GPT-4 (primary paid option)
- Claude (planned/configured)
- Free/mock generation mode for testing

**Generation Flow**:
1. Accept prompt, keywords, word count, and provider selection
2. For paid providers, use respective API with stored API keys
3. Generate SEO-optimized HTML content with proper heading structure
4. Return content with metadata (meta description, slug, focus keyword)

**SEO Optimization**: Automated generation of SEO metadata including:
- Meta descriptions (155 character limit)
- URL-friendly slugs
- Focus keyword extraction
- Keyword density analysis

### External Integrations

**WordPress Integration**:
- Yoast SEO Premium (v25.7+) - SEO plugin integration for content optimization
- Jetpack - Performance, security, and publishing features
- Custom WordPress plugin provided for embedding the Replit app into WordPress admin

**Workflow Automation**:
- n8n integration planned/configured for workflow orchestration
- Connection health checking endpoints for integration status

**API Integrations**:
- OpenAI API for content generation
- Placeholder integrations for LinkedIn sharing, email notifications
- Extensible design allows marketplace-style plugin additions

### Deployment & Embedding

**Replit-Specific Features**:
- Custom Vite plugins for Replit development environment
- Runtime error overlay for debugging
- Dev banner and cartographer integration in development mode
- Meta image plugin automatically updates OpenGraph images with correct Replit domain

**WordPress Embedding Strategy**: 
- Provides PHP plugin code that embeds the entire Replit application in an iframe
- Removes WordPress admin chrome for full-screen experience
- Single-page application architecture ensures smooth navigation within iframe

**Environment Detection**: Uses `REPL_ID` environment variable to enable Replit-specific features only when running on Replit infrastructure.

## External Dependencies

### Core Framework Dependencies
- **React 18** - UI framework
- **Express.js** - Backend server framework
- **TypeScript** - Type safety across full stack
- **Vite** - Build tool and dev server

### Database & ORM
- **PostgreSQL** - Primary database (connection via `DATABASE_URL` environment variable)
- **Drizzle ORM** - Type-safe SQL query builder
- **drizzle-kit** - Schema migration tooling
- **pg** (node-postgres) - PostgreSQL client

### UI Component Libraries
- **Radix UI** - Headless component primitives (accordion, dialog, dropdown, select, etc.)
- **shadcn/ui** - Pre-styled component system built on Radix
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Recharts** - Data visualization and charting

### State Management & Data Fetching
- **TanStack Query** - Server state management and caching
- **Axios** - HTTP client for API requests
- **Wouter** - Lightweight routing library

### Form & Validation
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **@hookform/resolvers** - Form validation resolver integration

### AI & Content Generation
- **OpenAI SDK** - GPT-4 API integration
- **Cheerio** - HTML parsing and manipulation (for content extraction/analysis)

### Build & Development Tools
- **esbuild** - Fast JavaScript bundler for production builds
- **tsx** - TypeScript execution for development and build scripts
- **PostCSS** - CSS processing with Autoprefixer

### Replit-Specific Plugins
- **@replit/vite-plugin-runtime-error-modal** - Development error overlay
- **@replit/vite-plugin-cartographer** - Development tooling
- **@replit/vite-plugin-dev-banner** - Development environment indicator

### Additional Utilities
- **nanoid** - Unique ID generation
- **date-fns** - Date manipulation and formatting
- **clsx** / **tailwind-merge** - Conditional className utilities
- **class-variance-authority** - Component variant management

### Planned/Configured Integrations
- **Stripe** - Payment processing (installed but not implemented)
- **Nodemailer** - Email notifications
- **connect-pg-simple** - PostgreSQL session store
- **express-session** - Session management middleware
- **passport** / **passport-local** - Authentication strategy
- **multer** - File upload handling
- **ws** - WebSocket support
- **xlsx** - Spreadsheet file handling
- **express-rate-limit** - API rate limiting
- **jsonwebtoken** - JWT token generation/validation