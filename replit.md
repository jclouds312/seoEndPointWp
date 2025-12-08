# Overview

This is a comprehensive SEO Automation Hub built as a full-stack web application. The platform is designed for legal content marketing and SEO management, specifically targeting California personal injury law firms. It provides tools for bulk content generation, SEO analysis, campaign management, WordPress integration, and workflow automation. The application features a modern React frontend with a Node.js/Express backend, using PostgreSQL for data persistence through Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**UI Component System**: Shadcn/ui components built on Radix UI primitives, styled with Tailwind CSS v4. The design system uses the "new-york" style variant with a neutral color palette and CSS variables for theming.

**Routing**: Wouter with hash-based routing (`useHashLocation`) for client-side navigation. All routes are defined in `client/src/App.tsx` and wrapped in a `SidebarLayout` component for consistent navigation.

**State Management**: TanStack Query (React Query) v5 for server state management, with custom query functions defined in `lib/queryClient.ts`. No global state management library is used - component-level state is managed with React hooks.

**Design Patterns**:
- Component composition with consistent Card/CardHeader/CardContent patterns
- Custom hooks for shared functionality (e.g., `useIsMobile`, `useToast`)
- Path aliases configured (`@/`, `@shared/`, `@assets/`) for clean imports
- Separation of concerns: pages, components, lib utilities, and hooks in distinct directories

## Backend Architecture

**Runtime**: Node.js with TypeScript, using ESM modules throughout.

**Framework**: Express.js for HTTP server and routing, with a custom build process using esbuild to bundle the server for production.

**API Design**: RESTful API with routes defined in `server/routes.ts`. Key endpoints include:
- `/api/bulk-massive/generate` - Bulk content generation (8 posts from seed keyword)
- `/api/campaigns` - Campaign CRUD operations
- `/api/generated-content` - Content management
- `/api/wp-seo/health` - WordPress integration health checks

**Build Process**: Custom build script (`script/build.ts`) that:
1. Builds the client with Vite
2. Bundles the server with esbuild
3. Uses an allowlist to bundle specific dependencies for improved cold start performance
4. Outputs to `dist/` directory with separate `public/` and server bundle

**Development vs Production**:
- Development: Vite dev server with HMR, custom error overlay, and Replit-specific plugins
- Production: Serves static files from `dist/public` with Express, falls through to `index.html` for SPA routing

## Data Storage

**Database**: PostgreSQL accessed through Drizzle ORM.

**Schema Location**: `shared/schema.ts` - shared between client and server for type safety.

**Key Tables**:
- `users` - Authentication and user management
- `campaigns` - SEO campaign tracking with blog URLs and embed codes
- `generatedContent` - AI-generated posts with SEO metadata, status tracking, and batch association
- `bulkGenerationBatches` - Tracking for bulk content generation jobs

**ORM Features**:
- Drizzle-Zod integration for runtime validation
- Type-safe queries with full TypeScript inference
- Migration support via `drizzle-kit` (migrations in `./migrations`)

**Connection**: Environment variable `DATABASE_URL` required. Connection pooling via `pg.Pool`.

## Authentication & Authorization

**Strategy**: The codebase shows a login page (`client/src/pages/auth.tsx`) with hardcoded credentials (`walchlaw4` / `eJs3M*LnfSSo68P!RtXC9lZ`) suggesting this is either a development/demo setup or authentication is handled externally.

**Session Management**: Dependencies include `express-session` and `connect-pg-simple` for PostgreSQL-backed sessions, though implementation is not visible in provided files.

**Security Considerations**: 
- The application uses `rawBody` verification for webhook validation
- CORS support via the `cors` package
- Rate limiting via `express-rate-limit`

## External Dependencies

**AI Content Generation**:
- OpenAI API integration (via `openai` package)
- Google Generative AI (`@google/generative-ai`)
- Content generation workflows support multiple providers

**WordPress Integration**:
- Jetpack features integration (`client/src/pages/jetpack-integration.tsx`)
- WP-SEO health checks endpoint
- Plugin deployment via embed code generation
- WordPress admin iframe embedding for seamless integration

**Workflow Automation**:
- n8n workflow integration (referenced in `workflow-editor.tsx`)
- Ability to trigger, activate/deactivate workflows
- REST API communication with n8n instance

**Web Scraping**:
- Cheerio for HTML parsing and data extraction
- Axios for HTTP requests

**Third-Party Services**:
- Stripe payment processing
- Nodemailer for email notifications
- WebSocket support (`ws` package)

**Development Tools**:
- Replit-specific Vite plugins: runtime error modal, cartographer, dev banner
- Custom meta images plugin for OpenGraph tags
- TypeScript strict mode with ESNext modules

**Data Processing**:
- `xlsx` for spreadsheet import/export
- `date-fns` for date manipulation
- `zod` with `zod-validation-error` for schema validation

**Deployment Target**: 
- Vercel (build logs in `attached_assets/`)
- Replit (custom Vite plugins and deployment URL detection)
- Generic Node.js environments via `npm start`