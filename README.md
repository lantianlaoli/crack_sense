# CrackCheck

A Next.js application for crack checking functionality.

## Tech Stack

- **Next.js 15.4.4** with App Router
- **React 19.0.0** with TypeScript
- **Tailwind CSS v4** for styling
- **Clerk** for authentication
- **Supabase** for database and backend services
- **Upstash Redis** for caching
- **Resend** for email services

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/cxp-13/CrackCheck.git
cd CrackCheck
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Fill in the required environment variables in `.env`.

4. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

## Project Structure

```
├── app/                # Next.js App Router pages and API routes
├── components/         # React components
├── lib/               # Utility libraries and configurations
├── hooks/             # Custom React hooks
├── public/            # Static assets
└── middleware.ts      # Clerk authentication middleware
```