# FinTrack Pro — MERN Finance Tracker with AI Coach 💰✨

**FinTrack Pro** is a sophisticated, full-stack financial management application built with the MERN stack. It features an intelligent **AI Money Coach**, a premium **Glassmorphic UI**, and a data-driven dashboard to help users track their spending and achieve their savings goals.

![Full Width Dashboard](frontend/vite-project/public/dashboard_preview.png) *(Note: Add your screenshot here)*

## 🚀 Key Features

-   **Intelligent AI Money Coach**: A data-aware assistant that analyzes your transactions, provides budget breakdowns (50/30/20 rule), and offers personalized savings tips.
-   **Premium Glassmorphic UI**: A modern, dark-themed interface with edge-to-edge layout, smooth transitions, and interactive components.
-   **Real-time Dashboard**: Live summary cards for Balance, Income, Expenses, and Savings Rate.
-   **Smart Transaction Management**: Add, edit, and delete transactions with ease. Includes a visual "Success" animation.
-   **Advanced AI Support**: Integrated with **Google Gemini AI** for conversational financial advice.
-   **Admin Controls**: Role-based access for managing all user transactions.

## 🛠️ Tech Stack

-   **Frontend**: React, Vite, Vanilla CSS (Premium Glassmorphism).
-   **Backend**: Node.js, Express.
-   **Database**: MongoDB (Mongoose).
-   **AI**: Google Generative AI (Gemini 1.5 Flash).

## 🏃‍♂️ Quick Start

### 1. Prerequisites
-   Node.js & npm installed.
-   MongoDB running locally (`mongod --dbpath ~/mongodb-data`).

### 2. Setup Backend
```bash
cd backend
npm install
# Create a .env file (see backend/README.md for details)
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend/vite-project
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## 📂 Project Structure

-   `/backend`: Express server, MongoDB models, and AI advisor logic.
-   `/frontend/vite-project`: React application with the Glassmorphic design system.

---
*Developed for the Semester Project — Powered by AI.*
