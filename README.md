# FinTrack Pro — MERN Finance Tracker with AI Money Coach 💰✨

**FinTrack Pro** is a full-stack financial management application built with the MERN (MongoDB, Express, React, Node.js) stack. It combines a powerful backend API with a beautiful glassmorphic UI to help users track spending, manage budgets, and receive personalized financial advice from an AI-powered Money Coach.

## 📋 Project Overview

FinTrack Pro addresses the common challenge of personal financial management by providing users with:
- A centralized platform to track all financial transactions
- Real-time insights into spending patterns and financial health
- An intelligent AI assistant that provides budget recommendations using the 50/30/20 rule
- Role-based access control for multi-user scenarios (Admin & User roles)
- Secure authentication with JWT tokens

## 🎯 Key Features

### 1. **User Authentication & Authorization**
- Secure registration and login with bcrypt password hashing
- JWT-based authentication for API protection
- Role-based access control (User & Admin roles)
- Password reset functionality with email support
- Session persistence with secure token storage

### 2. **Transaction Management**
- Add, view, edit, and delete financial transactions
- Categorize transactions (Food, Salary, Housing, Transport, Shopping, Bills, Health, Education, Entertainment, Others)
- Filter by payment method (Cash, UPI, Card, Bank Transfer, Wallet, Net Banking)
- Sort transactions by date and amount
- Real-time updates with success animations

### 3. **Financial Dashboard & Analytics**
- Real-time balance calculation
- Income vs. Expense breakdown
- Savings rate calculation
- Category-wise spending analysis
- Visual charts and graphs using Recharts
- Monthly trend analysis

### 4. **AI Money Coach**
- Conversational AI assistant powered by **Google Gemini 1.5 Flash**
- Context-aware financial advice based on user's actual transaction data
- Budget recommendations using the 50/30/20 rule (Needs/Wants/Savings)
- Top spending category analysis
- Personalized savings tips and financial guidance

### 5. **Premium UI/UX**
- Modern glassmorphic design with blur effects
- Dark theme optimized for screen fatigue reduction
- Smooth animations and micro-interactions
- Responsive layout for different screen sizes
- Interactive charts and data visualization

### 6. **Admin Controls**
- View and manage all user transactions
- Monitor platform usage
- Access user activity logs

## 🛠️ Tech Stack

### Frontend
- **React 19.2** - UI library for building interactive components
- **Vite 8** - Lightning-fast build tool and dev server
- **Vanilla CSS** - Custom pure CSS for glassmorphic design (no heavy frameworks)
- **Recharts** - React charting library for data visualization
- **Axios** - HTTP client for API communication
- **ESLint** - Code quality and style enforcement

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 5** - Lightweight web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose 9.3** - ODM for MongoDB schema management
- **JWT** - Secure token-based authentication
- **Bcryptjs** - Password hashing for security
- **Google Generative AI** - AI-powered financial advice
- **Nodemailer** - Email service for password reset
- **CORS & Dotenv** - Security and configuration management

### Development Tools
- **Nodemon** - Auto-restart server during development
- **Babel & Vite Plugin React** - Modern JavaScript compilation
- **ESLint & Prettier** - Code quality and formatting

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FINTRACK PRO ARCHITECTURE                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐          ┌──────────────────────┐     │
│  │  React Frontend  │◄────────►│  Express.js Backend  │     │
│  │  (Vite, CSS)     │  HTTP/   │  (Node.js, REST API) │     │
│  └──────────────────┘  JWT     └──────────────────────┘     │
│         │                              │                     │
│         │                              │                     │
│         └──────────────┬───────────────┘                     │
│                        │                                     │
│                        ▼                                     │
│               ┌─────────────────┐                            │
│               │    MongoDB      │                            │
│               │   (Database)    │                            │
│               └─────────────────┘                            │
│                                                               │
│  External Services:                                          │
│  • Google Gemini AI (Financial Advice)                      │
│  • Gmail SMTP (Email Notifications)                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📂 Project Structure

```
financial-tracker/
├── README.md                          # Main project documentation
├── DEPLOYMENT.md                      # Deployment guide for production
│
├── backend/                           # Node.js/Express backend
│   ├── server.js                      # Express server entry point
│   ├── seed.js                        # Database seeding script
│   ├── .env                           # Environment variables (local)
│   ├── .env.example                   # Example env template
│   ├── package.json                   # Backend dependencies
│   │
│   ├── controllers/                   # Business logic
│   │   ├── authController.js          # Auth endpoints logic
│   │   ├── transactionController.js   # Transaction CRUD logic
│   │   └── advisorController.js       # AI advisor logic
│   │
│   ├── models/                        # Database schemas
│   │   ├── User.js                    # User schema (email, password, role)
│   │   └── Transaction.js             # Transaction schema (amount, category, date)
│   │
│   ├── routes/                        # API endpoints
│   │   ├── authRoutes.js              # Authentication endpoints
│   │   ├── transactionRoutes.js       # Transaction endpoints
│   │   ├── advisorRoutes.js           # AI advisor endpoints
│   │   └── adminRoutes.js             # Admin management endpoints
│   │
│   └── middleware/                    # Express middleware
│       ├── authMiddleware.js          # JWT verification
│       └── roleMiddleware.js          # Role-based access control
│
├── frontend/                          # React frontend
│   └── vite-project/
│       ├── package.json               # Frontend dependencies
│       ├── vite.config.js             # Vite configuration
│       ├── index.html                 # HTML entry point
│       ├── .env                       # Environment variables (prod)
│       ├── .env.example               # Example env template
│       ├── .env.development.local     # Dev environment config
│       │
│       ├── src/
│       │   ├── main.jsx               # React entry point
│       │   ├── App.jsx                # Main application component
│       │   ├── Login.jsx              # Authentication UI
│       │   ├── App.css                # Application styles
│       │   ├── ModernApp.css          # Glassmorphic styles
│       │   ├── index.css              # Global styles
│       │   └── assets/                # Images and icons
│       │
│       └── public/                    # Static assets
```

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js 16+** and **npm** installed
- **MongoDB** (local or cloud - MongoDB Atlas recommended)
- **Google Gemini API key** (optional - app works without it)

### Installation & Setup

#### 1. Clone and Navigate
```bash
git clone https://github.com/Durga4896/financial-tracker.git
cd financial-tracker
```

#### 2. Setup Backend
```bash
cd backend
npm install

# Create .env file with your configuration
cp .env.example .env
# Edit .env and fill in:
# - MONGO_URI (MongoDB connection string)
# - JWT_SECRET (strong random key)
# - GEMINI_API_KEY (optional)

npm run dev
# Backend runs on http://localhost:3001
```

#### 3. Setup Frontend (in new terminal)
```bash
cd frontend/vite-project
npm install

# .env is pre-configured for local development
npm run dev
# Frontend runs on http://localhost:5173
```

#### 4. Access the Application
- Open browser: `http://localhost:5173`
- Register a new account
- Start tracking transactions!

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT token)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Transaction Endpoints
- `GET /api/transactions` - Get user's transactions
- `POST /api/transactions/add` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary/me` - Get financial summary

### AI Advisor Endpoints
- `POST /api/advisor/chat` - Chat with AI Money Coach

### Admin Endpoints
- `GET /api/admin/users` - Get all users
- `GET /api/admin/transactions` - Get all transactions

## 🔐 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based API authentication
- **CORS Protection**: Whitelist-based CORS configuration
- **Role-Based Access Control**: User vs Admin permissions
- **Environment Variables**: Sensitive data never hardcoded
- **Email Verification**: Password reset with secure tokens

## 🚀 Deployment

Full deployment instructions available in [DEPLOYMENT.md](DEPLOYMENT.md)

### Quick Deployment Options
- **Frontend**: Vercel, Netlify
- **Backend**: Render, Railway, Heroku
- **Database**: MongoDB Atlas (free tier available)

## 📊 Data Models

### User Model
```javascript
{
  email: String (unique),
  password: String (hashed),
  role: String (User/Admin),
  createdAt: Date
}
```

### Transaction Model
```javascript
{
  userId: ObjectId (reference to User),
  amount: Number,
  description: String,
  category: String (predefined categories),
  transactionType: String (income/expense),
  paymentMethod: String,
  date: Date,
  _id: ObjectId
}
```

## 🤖 AI Money Coach Logic

The AI advisor works in two modes:

1. **With Gemini API**: 
   - Analyzes user's transaction patterns
   - Calculates savings rate, top categories, income/expense ratio
   - Provides context-aware financial advice using Gemini

2. **Fallback (Without API)**:
   - Local rule-based advisor
   - Returns 50/30/20 rule recommendations
   - Suggests savings strategies

## 🖥️ Environment Requirements

### Backend (.env)
```env
PORT=3001
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/finance
JWT_SECRET=your_strong_secret_key
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_google_api_key
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## 📚 Future Enhancements

- [ ] Budget planning and tracking
- [ ] Recurring transactions
- [ ] Multi-currency support
- [ ] Data export (CSV, PDF)
- [ ] Mobile app (React Native)
- [ ] Advanced analytics and forecasting
- [ ] Goal setting and tracking
- [ ] Investment portfolio tracking

## 🤝 Contributing

This is a semester project. For improvements or bug fixes:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

ISC License - Free to use and modify

## 👤 Author

**Durga Sai Prasad Yalamkayala**  
Semester Project - Full-Stack Development

---

## 🎓 Learning Outcomes

This project demonstrates:
- Full-stack MERN development
- RESTful API design and implementation
- Database design and management
- Authentication and authorization
- AI/ML integration (Google Gemini API)
- Responsive UI/UX design
- Security best practices
- Deployment and DevOps

---

**For detailed backend documentation**, see [backend/README.md](backend/README.md)  
**For detailed frontend documentation**, see [frontend/vite-project/README.md](frontend/vite-project/README.md)  
**For deployment instructions**, see [DEPLOYMENT.md](DEPLOYMENT.md)
