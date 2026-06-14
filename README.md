# QualiAI | AI-Powered Lead Qualification Platform MVP

QualiAI is a complete working MVP designed to capture, analyze, score, and qualify inbound customer leads automatically using LLMs. It supports dual modes: **Demo Mode** (zero-config, SQLite file database, mock AI responses, logged notifications) and **Production Mode** (PostgreSQL, live OpenRouter API, Telegram Bot integration) switching seamlessly via environment variables.

---

## ⚡ Quick Start (Demo Mode)

To start the platform immediately in **Demo Mode** (no external services required):

1. **Install Dependencies**
   From the project root directory, run:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Launch Development Servers**
   Open two terminal windows/sessions:

   * **Terminal 1: Start Backend API Server**
     ```bash
     cd backend
     npm run dev
     ```
     *Runs on http://localhost:5000*

   * **Terminal 2: Start Frontend App**
     ```bash
     cd frontend
     npm run dev
     ```
     *Runs on http://localhost:5173*

3. **Access the Application**
   * Open your browser and navigate to: **`http://localhost:5173/`**
   * Log in using the seeded Admin credentials:
     * **Email:** `admin@quali.ai`
     * **Password:** `admin123`
     * *(Or click "Autofill Seed Demo Credentials" on the login screen)*

---

## 🚀 Transitioning to Production Mode

To connect live APIs and production data engines:

1. Open the `.env` file in the project root.
2. Provide your API keys and connection parameters:

   ```env
   # Database (PostgreSQL)
   DATABASE_URL=postgresql://your_db_user:your_db_password@localhost:5432/qualiai

   # AI Qualification (OpenRouter API Key)
   OPENROUTER_API_KEY=your_openrouter_api_key

   # Telegram NotificationBot Integration
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_CHAT_ID=your_telegram_chat_id
   ```

3. Restart the backend service (`npm run dev` in the backend folder). The console will output messages indicating it detected Postgres/OpenRouter/Telegram and activated live production interfaces.

---

## 📂 Project Architecture & Code Map

### Backend Code map
* **[db.ts](backend/src/config/db.ts):** Dual-driver database abstraction layer. Performs SQL placeholder translations (`$1` ➔ `?`) and auto-runs schema setups.
* **[ai.ts](backend/src/services/ai.ts):** OpenRouter API integration. Maps customer queries to prompt templates and includes responsive Mock fallbacks.
* **[telegram.ts](backend/src/services/telegram.ts):** Telegram bot API notifier. Logs structured payloads to terminal console when Bot keys are absent.
* **[leads.ts](backend/src/controllers/leads.ts):** Evaluates inbound forms, triggers AI parsing, saves results, and dispatches notifications.

### Frontend Code map
* **[LeadForm.tsx](frontend/src/pages/LeadForm.tsx):** public landing form where prospective clients submit queries. Evaluates inputs and renders real-time scoring mockups.
* **[Dashboard.tsx](frontend/src/pages/Dashboard.tsx):** Summary stats cards and interactive qualification details.
* **[Leads.tsx](frontend/src/pages/Leads.tsx):** Searchable, paginated, and sortable tabular review log.
* **[LeadDetails.tsx](frontend/src/pages/LeadDetails.tsx):** Visualizes detailed AI analysis metrics and features a copyable auto-generated client follow-up script.
