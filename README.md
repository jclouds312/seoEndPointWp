
# SEO Hub Enterprise

[![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/yourusername/seo-hub)
[![License](https://img.shields.io/badge/license-Private%20Enterprise-red.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](https://nodejs.org)

## 📋 Overview

SEO Hub Enterprise is a comprehensive content generation and management platform designed for high-velocity SEO strategies. It leverages advanced AI to orchestrate content clusters, analyze SEO performance, and streamline the publishing workflow for WordPress sites.

## ✨ Key Features

### 🚀 Bulk Massive Generator (Enterprise Module)
**v2.1.0** - High-velocity content cluster deployment system

- **High-Velocity Clusters:** Generate 8 interconnected, SEO-optimized articles simultaneously using the Super Version engine
- **Smart Interlinking:** Automatically builds semantic links between generated posts to create silo structures
- **Advanced Configuration:**
  - Target specific websites and languages
  - Define Tone of Voice and Target Audience
  - Toggle Schema.org structured data injection
  - DALL-E 3 Image Generation integration
- **Visual Progress:** Real-time generation queue with status indicators
- **Template System:** Quick-start templates for legal and niche topics

### ⚡ Bulk Content Generator
Flexible batch content generation system

- **Flexible Batches:** Generate content in groups of 2, 3, 4, or 6 posts
- **Template Library:** Quick-start templates for common legal and niche topics
- **Export Options:** Download content as JSON, CSV, Markdown, or TXT
- **Performance Analytics:** Dashboard for tracking generated posts, SEO scores, and publishing stats

### 📊 SEO & Analytics Tools

- **SEO Analyzer:** Deep dive into content performance with real-time metrics
- **Content Manager:** Organize, edit, and publish drafts with workflow management
- **Keyword Analysis:** Track keyword density and optimization
- **Meta Description Editor:** Character counter with optimal length indicators (160 chars)

### 🗺️ Local SEO & Geo-Targeting

- **Interactive Map Widgets:** SVG-based visualization of content coverage by region
- **Zone Targeting:** Configure content for specific geographic areas (e.g., Los Angeles, San Diego)
- **Performance Tracking:** Monitor local SEO performance by region

### 🔗 WordPress Integration

- **Jetpack Integration:** 
  - Performance & Speed optimization (Image CDN, Lazy Loading)
  - Security Scanning (Downtime Monitoring, Brute Force Protection)
  - One-click configuration with toggle switches
  
- **Plugin Deployment:**
  - Auto-generated PHP snippet for WordPress integration
  - Simple drag-and-drop installation via `wp-content/plugins/`
  - REST API connectivity for post management

### 🔄 Workflow Automation

- **n8n Workflow Editor:** Visual node-link diagram for automation design
- **Campaign Management:** Organize and schedule bulk publishing campaigns
- **Data Sources Integration:** Connect multiple content sources

### 🎨 User Interface

- **Modern Design:** Built with Tailwind CSS and Shadcn/UI components
- **Dark Mode Support:** Full theme customization
- **Responsive Layout:** Optimized for desktop and mobile
- **Real-time Updates:** Live status indicators and progress tracking

## 🏗️ Architecture & Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight routing)
- **State Management:** TanStack Query (React Query)
- **UI Components:** Shadcn/UI + Radix UI primitives
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod validation

### Backend
- **Runtime:** Node.js with TypeScript
- **Server:** Express.js
- **Build Tool:** Vite
- **Database:** Drizzle ORM (configured)

### Key Dependencies
```json
{
  "react": "^18.x",
  "typescript": "^5.x",
  "express": "^4.x",
  "wouter": "^3.x",
  "@tanstack/react-query": "^5.x",
  "tailwindcss": "^3.x"
}
```

## 🚀 Getting Started

### Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **WordPress:** 6.0+ (for integration)
- **PHP:** 7.4+ (for WordPress plugin)
- **Yoast SEO Premium:** v25.7+ (recommended)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/seo-hub-enterprise.git
   cd seo-hub-enterprise
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables** (if needed):
   Create a `.env` file in the root directory with necessary API keys.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   Navigate to `http://localhost:5000` in your browser.

### Production Build

```bash
npm run build
npm start
```

The production server will run on port 5000 by default.

## 📚 Documentation

### Quick Links

- **Installation Guide:** See [Documentation Page](client/src/pages/documentation.tsx)
- **Deployment Instructions:** See [Deployment Page](client/src/pages/deployment.tsx)
- **API Reference:** Available at `/api` endpoints

### WordPress Integration

1. Navigate to the **Deployment** page in the dashboard
2. Copy the generated PHP snippet code
3. Create `seo-hub-embed.php` in your WordPress `wp-content/plugins/` directory
4. Paste the code and replace `[YOUR-REPLIT-URL]` with your Replit App URL
5. Activate the plugin via WordPress Admin → Plugins
6. A new "SEO Hub" menu item will appear in your WordPress sidebar

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/seo/audit` | Triggers a new SEO audit for the connected site |
| `POST` | `/api/publish/batch` | Initiates a bulk publishing campaign |
| `GET` | `/api/keywords/analyze` | Returns keyword density metrics |

### Configuration

**WordPress REST API:** `/wp-json/wp/v2/`
- Used to fetch posts and update metadata
- Requires authentication token

**Yoast SEO Premium:** `sk_live_...`
- Required for advanced keyword analysis features
- Configure in Settings → Integrations

## 📂 Project Structure

```
seo-hub-enterprise/
├── client/                  # Frontend application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   └── ui/        # Shadcn/UI components
│   │   ├── pages/         # Application pages/routes
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   └── types/         # TypeScript type definitions
│   └── index.html         # HTML entry point
├── server/                 # Backend application
│   ├── index.ts           # Express server setup
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data persistence
├── script/                # Build scripts
├── shared/                # Shared types/schemas
└── package.json          # Project dependencies
```

## 🎯 Available Pages & Modules

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | Main analytics and overview |
| Bulk Massive Generator | `/bulk-massive` | Enterprise cluster generation (v2.1.0) |
| Bulk Content Generator | `/bulk-content` | Standard batch generation |
| Content Creator | `/content-creator` | Single article creation |
| Content Manager | `/content-manager` | Draft organization and editing |
| SEO Analyzer | `/seo-analyzer` | Performance analysis tools |
| Local SEO | `/local-seo` | Geo-targeting and mapping |
| Workflow Editor | `/workflow-editor` | n8n automation design |
| Campaigns | `/campaigns` | Campaign management |
| Sites | `/sites` | Multi-site configuration |
| Integrations | `/integrations` | Third-party connections |
| Jetpack Integration | `/jetpack` | Jetpack configuration |
| Deployment | `/deployment` | WordPress plugin deployment |
| Documentation | `/documentation` | Full documentation |
| Settings | `/settings` | System preferences |

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start backend server (port 5000)
npm run dev:client       # Start Vite dev server (port 5000)

# Production
npm run build           # Build for production
npm start              # Start production server

# Utilities
npm run check          # TypeScript type checking
npm run db:push        # Push database schema changes
```

## 🔒 Security & Authentication

- WordPress REST API authentication via tokens
- Secure credential storage for API keys
- HTTPS encryption for production deployments
- Brute force protection via Jetpack integration

## 📈 Performance Optimization

- **Image CDN:** Jetpack global CDN for image delivery
- **Lazy Loading:** On-demand resource loading
- **Code Splitting:** Vite-based chunking
- **Caching:** TanStack Query for API response caching

## 🐛 Debugging & Logging

The server includes comprehensive logging for API requests:

```
12:34:56 PM [express] GET /api/seo/audit 200 in 45ms :: {"status":"success"}
```

## 🤝 Contributing

This is a private enterprise project. Contact the administrator for contribution guidelines.

## 📄 License

**Private Enterprise License** - All rights reserved.

## 🆘 Support

For technical support or feature requests, please contact your system administrator.

## 🔄 Version History

### v2.1.0 (Current)
- ✅ Bulk Massive Generator with 8-article clusters
- ✅ Enhanced Template System
- ✅ Jetpack Integration Module
- ✅ Geo-Targeting Map Widgets
- ✅ Meta Description Editor
- ✅ Real-time Progress Tracking

### v2.0.0
- Initial enterprise release
- WordPress REST API integration
- Basic content generation

---

**Built with ❤️ for high-velocity SEO strategies**
