# QualiAI Project Documentation

## 1. Project Overview

QualiAI is an AI-powered lead qualification platform for businesses that receive client inquiries through online forms. The system captures customer details, understands the customer requirement using AI, scores the lead, stores the result, and sends a notification to the business team.

The main purpose of this project is to help businesses respond faster to potential customers and prioritize high-quality leads.

Example business flow:

```text
Client fills form -> Lead is stored -> AI analyzes lead -> Telegram alert is sent -> Admin reviews lead in dashboard
```

This project is useful for businesses such as:

- Real estate agencies
- Salons and spas
- Gyms and fitness centers
- Medical clinics
- Insurance agencies
- Coaching and education centers
- Any service business that receives customer inquiries

## 2. Business Problem

Many businesses receive leads from websites, ads, WhatsApp, or landing pages, but they often have these problems:

- Leads are not followed up quickly.
- The team does not know which lead is important.
- Customer details are scattered across forms, chats, and spreadsheets.
- Manual lead checking takes time.
- High-intent customers may be missed.

QualiAI solves this by automatically qualifying each lead and sending an instant notification.

## 3. What The Project Does

When a client submits the public lead form, the system:

1. Captures the client name, phone, email, business type, requirement, budget, and notes.
2. Saves the lead in the database.
3. Sends the lead details to the AI qualification service.
4. AI generates:
   - Lead score
   - Business type
   - Buying intent
   - Urgency score
   - Summary
   - Suggested follow-up message
5. Saves the AI analysis in the database.
6. Sends a Telegram notification to the business owner or sales team.
7. Shows the lead inside the admin dashboard.

## 4. Main Features

### Public Lead Capture Form

The public form is available at:

```text
/lead
```

Clients can submit:

- Name
- Phone number
- Email
- Business segment
- Requirement details
- Budget
- Additional notes

The form does not require login because it is meant for potential customers.

### Admin Authentication

Admin users can:

- Register a new account
- Login securely
- Logout
- Access protected dashboard pages only after authentication

Routes:

```text
/login
/register
```

If a user tries to open protected pages without login, the app redirects them to the login page.

### Dashboard

The dashboard shows:

- Total leads
- Today’s leads
- Average AI qualification score
- High-quality leads
- Recent leads
- Business segment mix
- Hot leads
- Pipeline conversion summary

Route:

```text
/dashboard
```

### Lead Management

The leads page allows admins to:

- View all captured leads
- Search leads
- Filter by status
- Filter by buying intent
- Sort leads
- Export leads as CSV
- Open detailed lead analysis

Route:

```text
/leads
```

### Lead Details Page

The lead details page shows:

- Client contact details
- Requirement
- Budget
- Notes
- Lead status
- AI score
- Business type
- Buying intent
- Urgency score
- AI summary
- AI-generated follow-up message

Admins can also:

- Update lead status
- Re-run AI analysis
- Copy the follow-up message

Route:

```text
/leads/:id
```

### Settings And Integration Status

The settings page shows:

- Current mode: Demo or Production
- Database provider
- OpenRouter AI configuration status
- Telegram configuration status
- Telegram test notification button

Route:

```text
/settings
```

## 5. Demo Mode

The project works even without external API keys.

If these values are empty:

```env
DATABASE_URL=
OPENROUTER_API_KEY=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

The app uses:

- SQLite local database
- Mock AI analysis
- Console-based Telegram notification mock

This makes the project easy to demo without setting up production services.

Default demo admin:

```text
Email: admin@quali.ai
Password: admin123
```

## 6. Production Mode

For production, configure:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-long-secure-secret
CORS_ORIGIN=https://your-frontend-domain.com
ALLOW_DEMO_SEED=false

DATABASE_URL=postgresql://username:password@host:5432/qualiai
OPENROUTER_API_KEY=your-openrouter-api-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

In production:

- PostgreSQL should be used instead of SQLite.
- A strong JWT secret is required.
- CORS should allow only your frontend domain.
- Demo admin seeding should be disabled.
- Real OpenRouter AI should be enabled.
- Real Telegram alerts should be enabled.

## 7. Technical Architecture

The project has two main parts:

```text
frontend/
backend/
```

### Frontend

Technology:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Lucide icons

Frontend responsibilities:

- Public lead form
- Login/register UI
- Protected dashboard pages
- Lead list and details UI
- Settings UI
- Token storage and session verification
- Redirect unauthenticated users to login

### Backend

Technology:

- Node.js
- Express
- TypeScript
- SQLite for demo
- PostgreSQL for production
- JWT authentication
- bcrypt password hashing

Backend responsibilities:

- Authentication APIs
- Lead submission API
- Lead management APIs
- AI qualification service
- Telegram notification service
- Database connection and migrations

## 8. Database Tables

### users

Stores admin users.

Fields:

- id
- name
- email
- password_hash
- created_at

### leads

Stores submitted client leads.

Fields:

- id
- name
- phone
- email
- business_requirement
- budget
- notes
- status
- created_at

### lead_analysis

Stores AI analysis for each lead.

Fields:

- id
- lead_id
- lead_score
- business_type
- summary
- buying_intent
- urgency_score
- follow_up_message

## 9. API Overview

### Auth APIs

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Lead APIs

```text
POST /api/leads/submit
GET  /api/leads
GET  /api/leads/stats
GET  /api/leads/insights
GET  /api/leads/recent
GET  /api/leads/export.csv
GET  /api/leads/config-info
POST /api/leads/test-telegram
GET  /api/leads/:id
PATCH /api/leads/:id/status
POST /api/leads/:id/reanalyze
```

Public API:

```text
POST /api/leads/submit
```

Protected APIs require:

```text
Authorization: Bearer <token>
```

## 10. Authentication Flow

1. User registers or logs in.
2. Backend verifies credentials.
3. Backend returns a JWT token.
4. Frontend stores token and user details in localStorage.
5. On app startup, frontend calls `/api/auth/me`.
6. If token is valid, user stays logged in.
7. If token is invalid or expired, user is logged out.
8. Protected pages redirect unauthenticated users to `/login`.

## 11. Lead Qualification Flow

```text
Client opens /lead
Client submits form
Backend validates fields
Backend saves lead
AI service analyzes lead
Backend saves AI analysis
Telegram service sends notification
Frontend success page shows lead ID and AI result
Admin views lead in dashboard
```

## 12. AI Analysis Logic

The AI evaluates:

- Requirement quality
- Business segment
- Buying intent
- Urgency
- Budget fit
- Follow-up message

Output example:

```json
{
  "lead_score": 90,
  "business_type": "Salon",
  "summary": "Client wants appointment automation and follow-up support.",
  "buying_intent": "High",
  "urgency_score": 95,
  "follow_up_message": "Hi John, thanks for your inquiry..."
}
```

## 13. Telegram Notification

When a new lead is submitted, Telegram receives:

- Lead name
- Phone number
- Business type
- Lead score
- AI summary

If Telegram keys are not configured, the backend logs the notification to the terminal for demo mode.

## 14. n8n Integration

The current project can already run the flow directly through the backend.

If n8n is required, the recommended flow is:

```text
Lead Form -> Backend -> n8n Webhook -> AI -> Telegram -> Database/Dashboard
```

Recommended future environment variable:

```env
N8N_WEBHOOK_URL=https://your-n8n-domain.com/webhook/lead
```

The backend can call this webhook after validating the lead submission.

## 15. How To Run Locally

Install backend:

```bash
cd backend
npm install
```

Install frontend:

```bash
cd frontend
npm install
```

Start backend:

```bash
cd backend
npm run dev
```

Start frontend:

```bash
cd frontend
npm run dev
```

Open:

```text
http://localhost:5173
```

## 16. How To Build

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

Frontend build output:

```text
frontend/dist
```

## 17. Deployment Plan

Recommended deployment:

- Frontend: Vercel, Netlify, or static Nginx hosting
- Backend: Render, Railway, Fly.io, or VPS
- Database: PostgreSQL
- AI: OpenRouter
- Notifications: Telegram Bot

Deployment steps:

1. Create PostgreSQL database.
2. Deploy backend.
3. Add production environment variables.
4. Deploy frontend.
5. Set frontend API proxy or API base URL if needed.
6. Register admin account.
7. Submit a test lead.
8. Confirm lead appears in dashboard.
9. Confirm Telegram receives notification.

## 18. Security Notes

Implemented security:

- Passwords are hashed using bcrypt.
- JWT is used for protected APIs.
- Protected frontend routes redirect to login.
- Stored tokens are verified on startup.
- Invalid or expired tokens force logout.
- Production rejects weak default JWT secret.
- Demo admin seeding is disabled by default in production.
- Basic security headers are added.
- CORS can be restricted using `CORS_ORIGIN`.

Recommended future improvements:

- Add rate limiting for login and lead submission.
- Add email verification.
- Add forgot password flow.
- Add role-based access control.
- Add audit logs.
- Move tokens to secure HTTP-only cookies for stronger browser security.
- Add CAPTCHA to public lead form if spam becomes a problem.

## 19. Business Demo Script

Use this flow during a demo:

1. Open `/lead`.
2. Fill a sample client inquiry.
3. Submit the form.
4. Show the success screen with lead ID and AI result.
5. Login as admin.
6. Open dashboard.
7. Show total leads and recent leads.
8. Open the submitted lead.
9. Show AI score, intent, urgency, summary, and follow-up message.
10. Open settings and show integration status.

## 20. Project Value

QualiAI helps a business:

- Capture every inquiry.
- Respond faster.
- Identify serious buyers.
- Save manual sales time.
- Keep all leads in one dashboard.
- Send instant alerts to the team.
- Improve conversion by prioritizing high-intent leads.

The project is currently ready for demo and can be made production-ready by connecting PostgreSQL, OpenRouter, Telegram, and a real deployment domain.
