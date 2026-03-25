# Baltutor frontend (demo shell)

React + Vite + TypeScript + MUI UI for the Baltutor / Owli demo. It calls **`GET /api/v1/public/marketing-bundle`** (onboarding, self-study, playbook, first-use copy), **`/access-policy`**, and session endpoints. Includes conversion playbook surfaces, multi-step paywall, usage meters, nudge, recall, and growth-oriented landing/onboarding patterns.

## Repo layout

This project lives in its own repository. Run it next to **baltutor-backend** (or any API that exposes the same routes).

## Run locally

1. Start the API on **`http://localhost:8080`** (from the backend repo):

   ```bash
   cd /path/to/baltutor-backend
   mvn spring-boot:run
   ```

2. Install and run this app:

   ```bash
   cd /path/to/baltutor-frontend
   npm install
   npm run dev
   ```

3. Open **`http://localhost:5173`**. The Vite dev server proxies **`/api`** → **`http://localhost:8080`**.

## Session header

The first response that includes **`X-Baltutor-Session`** stores a UUID in **`localStorage`** under **`baltutor_session_id`**. Use **Dev → New anonymous session** in the UI to clear it.

## Production

Point **`vite.config.ts`** `server.proxy` at your API host, or introduce **`VITE_API_BASE`** and resolve absolute URLs in **`src/api/baltutor.ts`**.

Subscribe actions are **disabled placeholders**—wire them to Play Billing / App Store / your billing flow.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Vite dev server          |
| `npm run build`| Typecheck + production build |
| `npm run lint` | ESLint                   |
