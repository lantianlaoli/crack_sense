# Repository Guidelines

## Project Structure & Module Organization
- App router: `app/` (pages, layouts, API routes under `app/api/*`).
- UI: `components/` (PascalCase `.tsx`), hooks in `hooks/`, shared logic in `lib/` (kebab-case `.ts`).
- Assets: `public/`.
- Config: `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `.eslintrc.json`.
- Data & DB: `supabase/migrations/` SQL files; scripts in `scripts/` (e.g., `import-products.js`).

## Build, Test, and Development Commands
- `pnpm dev` — run Next.js locally.
- `pnpm build` — production build.
- `pnpm start` — serve the built app.
- `pnpm lint` — lint with ESLint (Next + TS rules).
- `pnpm type-check` — TypeScript checks (`strict` mode).
- `pnpm run import-products` — load Amazon data into Supabase (requires env vars).

Tip: `npm run <script>` works if you’re not using pnpm.

## Coding Style & Naming Conventions
- TypeScript, 2-space indent, no semicolons (project default). Prefer explicit types and `zod` for runtime validation.
- Files: components `PascalCase.tsx`; hooks `useName.ts`; utilities `kebab-case.ts`.
- ESLint: extends `next/core-web-vitals`, `next/typescript`; fix warnings before PR.
- Tailwind CSS v4: keep classlists readable; extract repeated patterns to components.

## Testing Guidelines
- No formal test suite yet. When adding tests, prefer:
  - Unit: Jest + React Testing Library (`*.test.tsx`).
  - E2E: Playwright (`e2e/*.spec.ts`).
- Aim for coverage on critical flows (API routes, `lib/*` utilities).

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:` (see git history).
- PRs must: describe changes, include screenshots for UI, note env/migration impacts, and link issues.
- Ensure `pnpm lint` and `pnpm type-check` pass. For DB changes, include a migration in `supabase/migrations/` and brief notes.

## Security & Configuration Tips
- Copy `.env.example` to `.env` and fill required keys (Supabase, Clerk, OpenRouter, Creem, KIE).
- Never commit secrets. Use `NEXT_PUBLIC_*` only for values safe in the client.
- Keep server-only logic in API routes or server modules (avoid exposing `process.env` in client components).

