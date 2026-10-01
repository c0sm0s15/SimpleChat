# Frontend

- Use React with Vite and TypeScript for frontend application work.
- Start with shadcn/ui prebuilt blocks and components; customize them or build from scratch only when they do not fit the requirements.
- Manage frontend dependencies with npm from `frontend/`, and keep `package-lock.json` in sync. Do not edit lockfiles by hand.
- Keep API calls in `src/lib/api-client.ts` and feature-specific requests in `src/features/<feature>/api.ts`.
- Configure backend URLs with `VITE_API_ORIGIN` and `VITE_API_URL` in `frontend/.env.local`. Never put secrets in `VITE_*` variables; they are exposed to the browser.
- Use the existing shadcn configuration and import UI components through the `@/components/ui` alias.
- Available frontend checks are `npm run build` and `npm run lint`, run from `frontend/`.
