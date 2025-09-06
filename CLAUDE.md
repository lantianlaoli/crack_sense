# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CrackSense is a Next.js application that provides AI-powered crack analysis for building structures. It uses Clerk for authentication, Supabase for database operations, and integrates with OpenRouter for AI analysis and KIE AI for image processing with AR-style overlays.

## Development Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build production bundle  
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking
- `pnpm import-products` - Import repair products to database

## Architecture Overview

### Core Services Integration
- **Authentication**: Clerk handles user authentication and session management
- **Database**: Supabase PostgreSQL with comprehensive schema for crack analysis, conversations, and product recommendations
- **AI Analysis**: OpenRouter API (primarily Google Gemini 2.0 Flash) for detailed crack analysis
- **Image Processing**: KIE AI for adding AR-style measurement overlays to crack images
- **Payments**: Stripe integration for credit system

### Key Database Tables
- `cracks` - Core crack analysis records with detailed findings
- `conversations` - Chat-based crack analysis sessions  
- `conversation_messages` - Individual messages in conversations
- `user_credits` - Credit tracking system
- `crack_analyses` - Comprehensive analysis results with personalized assessments
- `repair_products` - Amazon product recommendations for repairs
- `product_recommendations` - AI-generated product suggestions

### Application Structure
- **API Routes**: `/app/api/` contains all backend endpoints for analysis, chat, uploads, and integrations
- **Dashboard**: User interface for crack analysis, history, and reports
- **Components**: Reusable UI components including analysis results, sidebars, and specialized crack analysis views
- **Lib**: Utility modules for AI clients, database operations, and business logic

### Key Integration Points
- **OpenRouter Client** (`lib/openrouter-client.ts`): Handles structured crack analysis with detailed engineering assessments
- **KIE Client** (`lib/kie-client.ts`): Processes images to add professional AR-style measurement overlays
- **Supabase Integration** (`lib/supabase.ts`): Contains all database types and client configuration
- **Product Recommendations** (`lib/product-recommendations.ts`): AI-powered repair product suggestions

## Environment Variables
Required environment variables include:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for database
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` for authentication  
- `OPENROUTER_API_KEY` for AI crack analysis
- `KIE_API_KEY` for image processing
- Various Stripe keys for payment processing

## Key Features
- **Homeowner Analysis**: Comprehensive crack analysis with engineering-grade assessments
- **Conversational Interface**: Chat-based interaction for detailed crack discussions
- **Visual Enhancement**: AR-style overlays showing measurements and risk levels on crack images
- **Product Integration**: Amazon product recommendations based on analysis results
- **Credit System**: Usage tracking and billing integration
- **Professional Reports**: PDF export capabilities for analysis results

## Development Notes
- Uses Tailwind CSS with custom Notion-inspired design system
- Implements comprehensive error handling and retry mechanisms for API calls
- Features responsive design optimized for both desktop and mobile crack analysis workflows
- Includes comprehensive SEO configuration and PWA capabilities