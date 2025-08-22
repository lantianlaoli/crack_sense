# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
- `pnpm dev` - Start Next.js development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking
- `pnpm import-products` - Import Amazon product data to Supabase

### Database
- Check Supabase tables: `node scripts/check-tables.js`
- Database migrations are stored in `supabase/migrations/`

## Architecture Overview

### Core Application
- **Next.js 15** with App Router architecture
- **Authentication**: Clerk for user management with protected routes via middleware
- **Database**: Supabase with PostgreSQL for data persistence
- **AI/ML**: LangChain integration with Gemini models (2.0-flash, 2.5-flash) via OpenRouter
- **Styling**: TailwindCSS v4 with custom components
- **Payments**: Creem integration for credit purchases

### Key Features
1. **AI-Powered Crack Analysis**: Upload images → AI analysis → Structured reports
2. **Credit System**: Usage-based billing with different AI model costs
3. **Conversation System**: Chat interface for follow-up questions about analyses
4. **Procurement Agent**: Smart product recommendations for crack repair materials
5. **Admin Panel**: Content management for articles and examples
6. **Blog System**: Dynamic content with slug-based routing

### Database Schema
- `cracks` - Legacy crack analysis records
- `crack_analyses` - New structured analysis system with templates
- `crack_cause_templates` - Predefined analysis templates by category
- `conversations` & `conversation_messages` - Chat system
- `user_credits` - Credit tracking and payment integration
- `articles` - Blog content management
- `repair_products` - Amazon product catalog with Vector embeddings
- `product_recommendations` - User recommendation tracking and analytics

### AI Analysis Pipeline
1. Image upload → Supabase storage
2. Credit validation and deduction
3. LangChain + Gemini model analysis with structured output
4. Template-based categorization using `crack-analysis-utils.ts`
5. Personalized recommendations generation
6. Storage in both legacy and new analysis tables

### Key Library Functions
- **Credits**: `lib/credits.ts` - User credit management
- **Analysis**: `lib/crack-analysis-utils.ts` - AI analysis categorization and recommendations
- **Procurement**: `lib/procurement-agent.ts` - Product recommendation engine with Vector search
- **LangChain**: `lib/langchain-config.ts` - Structured AI model configuration
- **Constants**: `lib/constants.ts` - Credit costs and system constants
- **Database**: `lib/supabase.ts` - Database types and client configuration

### Route Structure
- `/` - Landing page with Hero, Examples, Pricing
- `/dashboard` - Main analysis interface (protected)
- `/dashboard/history` - Analysis history and details
- `/admin` - Content management (admin only)
- `/blogs` - Public blog system
- `/examples` - Public analysis examples
- `/api/analyze` - Core AI analysis endpoint
- `/api/chat` - Conversation system with integrated product recommendations
- `/api/credits` - Credit management
- `/api/recommendations` - Product recommendation API (analysis & chat based)
- `/api/create-checkout` - Payment processing

### Environment Configuration
Required environment variables are documented in `.env.example`. The app requires:
- Supabase (database)
- Clerk (authentication)
- OpenRouter (AI models)
- Creem (payments)

### Security & Access Control
- Clerk middleware protects `/dashboard` routes
- Admin access controlled via `ADMIN_EMAIL` environment variable
- Credit validation before AI model usage
- Security headers configured in `next.config.ts`

### Component Architecture
- Modular UI components in `/components`
- **ProductRecommendations** component with smart filtering and Amazon integration
- Server actions for database operations
- Client-side state management for interactive features
- Responsive design with mobile-first approach

### Procurement Agent System
- **Vector Search**: Supabase pgvector for semantic product matching
- **Smart Recommendations**: Context-aware product suggestions based on crack analysis
- **Chat Integration**: Automatic product recommendations when users ask about repair materials
- **Amazon Integration**: Direct links to repair products with affiliate potential
- **Tracking**: User interaction analytics for recommendation optimization

## Development Notes
- TypeScript strict mode enabled
- Console logs removed in production builds
- Image optimization configured for multiple sources
- PDF export functionality for analysis reports