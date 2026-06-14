# QualiAI Production Guide

## What This Project Does

QualiAI captures client inquiries, qualifies them with AI, stores the lead and analysis, and sends a notification to Telegram. The normal business flow is:

1. Client submits the public lead form at `/lead`.
2. Backend stores the lead in the database.
3. AI analyzes the requirement, buying intent, urgency, and lead score.
4. Backend stores the AI analysis.
5. Telegram receives the lead alert.
6. Admin logs in to view leads, scores, summaries, and follow-up messages.

## Main Screens

- `/lead` - public client form. No login required.
- `/login` - admin login.
- `/register` - create an admin account.
- `/dashboard` - protected overview.
- `/leads` - protected lead table.
- `/leads/:id` - protected AI analysis and follow-up page.
- `/settings` - protected integration status and Telegram test.

## Authentication

- Dashboard routes are protected in React.
- Protected API routes require a JWT bearer token.
- Stored browser sessions are verified with `/api/auth/me` on app startup.
- Expired or invalid tokens are removed and the user is returned to login.
- Demo credentials are only seeded in production when `ALLOW_DEMO_SEED=true`.

## Local Demo

Run backend:

```bash
cd backend
npm install
npm run dev
```

Run frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

Demo login:

```text
admin@quali.ai
admin123
```

## Production Environment

Create a root `.env` file:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=use-a-long-random-secret-at-least-32-characters
CORS_ORIGIN=https://app.yourdomain.com
ALLOW_DEMO_SEED=false

DATABASE_URL=postgresql://username:password@host:5432/qualiai
OPENROUTER_API_KEY=your-openrouter-api-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

Important:

- Do not use the default JWT secret in production.
- Use PostgreSQL for production, not SQLite.
- Keep `.env` out of Git.
- Set `CORS_ORIGIN` to your real frontend domain.
- Register your real admin user through `/register`.
- Keep `ALLOW_DEMO_SEED=false` after setup.

## Build Commands

Backend:

```bash
cd backend
npm run build
npm start
```

Frontend:

```bash
cd frontend
npm run build
```

Deploy `frontend/dist` to a static host such as Vercel, Netlify, or Nginx. Deploy the backend to a Node host such as Render, Railway, Fly.io, or a VPS.

## Production Checklist

- PostgreSQL database is created and reachable.
- Backend starts with `NODE_ENV=production`.
- `JWT_SECRET` is strong and not the demo value.
- `CORS_ORIGIN` is set to the frontend URL.
- OpenRouter key is configured.
- Telegram bot token and chat ID are configured.
- `/settings` shows Production mode.
- `/settings` Telegram test sends a real alert.
- `/lead` creates a lead.
- `/leads` shows the submitted lead after login.
- Invalid or logged-out users are redirected to `/login`.

## n8n Integration Note

The current app processes the flow directly in the backend. If you want n8n in the middle, add an n8n webhook URL env var and call it inside `submitLead` after validation. Recommended production flow:

```text
Lead Form -> Backend validation -> n8n webhook -> AI -> Telegram -> Backend stores final result
```

For the current demo and MVP, the backend already performs the AI and Telegram steps reliably, with mock fallbacks when keys are empty.
