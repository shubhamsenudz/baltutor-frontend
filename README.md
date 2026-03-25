# Baltutor frontend (demo shell)

**Repository:** [github.com/shubhamsenudz/baltutor-frontend](https://github.com/shubhamsenudz/baltutor-frontend)

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

## API client (`src/api/baltutor.ts`)

Typed wrappers mirror the backend surface area:

- **`/api/health`**
- **Public:** `marketing-bundle`, `onboarding-experience`, `first-use-conversion`, `self-study`, `conversion-playbook`, `access-policy`
- **Session:** `GET/PATCH /session`, `first-use-nudge`, `ai-usage-today`, `today`, `parent-summary` (nullable 404), `recall-suggestions`, `weak-topics`
- **Chat:** threads CRUD-style + messages
- **Quiz:** `start`, `submit`
- **Homework:** multipart `upload`, `history`, question `learner-attempt` + `hint-step`
- **Curriculum:** chapters by class + subject
- **Feedback**, **Auth** (register / login / Google), **Analytics** events batch, **Support** bot + tickets, **Payments** (PhonePe / Paytm checkout — JWT required)

Optional JWT is stored under **`baltutor_access_token`** and sent as **`Authorization: Bearer`**. The dashboard **Full API lab** accordion exercises these calls end-to-end.

Server-only routes (webhooks, admin) are not included in the browser client by design.

## Production

Point **`vite.config.ts`** `server.proxy` at your API host, or introduce **`VITE_API_BASE`** and resolve absolute URLs in **`src/api/baltutor.ts`**.

Subscribe actions are **disabled placeholders**—wire them to Play Billing / App Store / your billing flow.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Vite dev server          |
| `npm run build`| Typecheck + production build |
| `npm run lint` | ESLint                   |
