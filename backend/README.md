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
GEMINI_API_KEY=your_google_gemini_api_key_here
```

*Note: The AI Coach works in "Digital Advisor" mode even without a Gemini API key using its local intelligence engine.*

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
