# FinTrack Pro — Backend 🛡️

The backend of FinTrack Pro is a robust Node.js/Express server that handles authentication, transaction logic, and the intelligent AI Advisor engine.

## ⚙️ Architecture

-   **Framework**: Express.js
-   **Database**: MongoDB with Mongoose ODM.
-   **Auth**: Custom JWT-based middleware.
-   **AI Engine**: `advisorController.js` handles both local "Digital Advisor" logic and cloud-based **Google Gemini AI** integration.

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=3001
MONGO_URI=mongodb://127.0.0.1:27017/finance
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_google_gemini_api_key_here
FRONTEND_URL=http://localhost:5173

# SMTP for forgot-password emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_app_password_here
MAIL_FROM=FinTrack Pro <your_email@example.com>
```

*Note: The AI Coach works in "Digital Advisor" mode even without a Gemini API key using its local intelligence engine.*

If SMTP is not configured, the forgot-password endpoint will log the reset link in local development instead of sending an email. In production, configure the SMTP values so users can reset through email.

## 📡 API Endpoints (Summary)

### Transactions
-   `GET /api/transactions`: Fetch current user's transactions.
-   `POST /api/transactions/add`: Create a new entry.
-   `PUT /api/transactions/:id`: Update an existing record.
-   `DELETE /api/transactions/:id`: Remove a record (Role-based).

### AI Coach
-   `POST /api/advisor/chat`: Strategic endpoint that processes financial queries and returns context-aware advice.

### Summary
-   `GET /api/transactions/summary/me`: Returns calculated aggregates (Income, Expense, Savings Rate).

## 🤖 AI Logic
The `chatAdvisor` controller automatically calculates user stats (savings rate, top categories) and injects them into the AI prompt to ensure responses are grounded in real user data.
