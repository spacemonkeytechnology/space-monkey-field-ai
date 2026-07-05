# Space Monkey Field AI

Production-quality MVP for field technicians who need cautious AI support from job-site photos. Users can sign in, upload an equipment or issue photo, describe the situation, ask a question, and save an AI-generated analysis plus a customer-friendly service report.

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, and Storage
- OpenAI Responses API for image analysis and report generation
- Official OpenAI TypeScript SDK

## Core safety behavior

The analysis prompt is designed to:

- avoid procedural instructions for dangerous electrical, gas, chemical, or structural work
- recommend licensed professionals for high-risk issues
- clearly state uncertainty
- include a warning that image analysis is not a replacement for professional inspection

This app is decision support only. It should not be positioned as a replacement for qualified inspection or licensed trade work.

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
# Optional override. Defaults to gpt-5.4-mini.
OPENAI_FIELD_ANALYSIS_MODEL=gpt-5.4-mini
```

4. In Supabase SQL Editor, run:

```sql
-- supabase/schema.sql
```

Paste the contents of `supabase/schema.sql`.

5. Start the app:

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Supabase notes

- The app expects a public storage bucket named `job-images`.
- Row-level security is enabled on `jobs`.
- The API route uses `SUPABASE_SERVICE_ROLE_KEY` to save generated reports and upload images after validating the user's Supabase session.
- Never expose the service role key in client-side code.

## OpenAI integration notes

- The field analysis endpoint uses the official OpenAI TypeScript SDK with `client.responses.create(...)`.
- Image input is sent as a data URL: `data:<mime>;base64,<image-bytes>`.
- Structured output is enforced with `text.format` and a strict JSON schema.
- Server logs include a local request ID, OpenAI request ID when available, model, status, usage, image metadata, request summary, and API error body.
- Logs intentionally exclude API keys and full base64 image data.

## Main routes

- `/` landing page
- `/login` login and signup
- `/dashboard` technician dashboard
- `/jobs/new` new job analysis
- `/jobs` job history
- `/jobs/[id]` individual job report

## Development checks

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Project structure

```text
app/
  api/analyze/route.ts
  dashboard/page.tsx
  jobs/page.tsx
  jobs/new/page.tsx
  jobs/[id]/page.tsx
components/
  auth-form.tsx
  jobs/
  layout/
  ui/
lib/
  openai.ts
  supabase-admin.ts
  supabase-browser.ts
  supabase-server.ts
  types.ts
supabase/
  schema.sql
```
