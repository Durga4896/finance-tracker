# FinTrack Pro — Backend Server 🛡️

The backend of FinTrack Pro is a robust Node.js/Express REST API that handles authentication, transaction management, data analytics, and AI-powered financial advisory. It serves as the core backbone for the frontend application.

## 📊 Backend Architecture

```
┌─────────────────────────────────────────────────┐
│          Express.js Server (Port 3001)          │
├─────────────────────────────────────────────────┤
│                                                  │
│  Routes Layer           Controllers Layer       │
│  ├─ authRoutes    ──►  authController          │
│  ├─ transactionRoutes ─► transactionController │
│  ├─ advisorRoutes ──►  advisorController       │
│  └─ adminRoutes   ──►  (Role-based logic)      │
│                                                  │
│           ▼                                     │
│  ┌──────────────────┐   ┌─────────────────┐   │
│  │ Middleware       │   │ External APIs   │   │
│  ├─ authMiddleware  │   ├─ Google Gemini  │   │
│  ├─ roleMiddleware  │   ├─ Gmail SMTP    │   │
│  └─ CORS, JSON      │   └─────────────────┘   │
│                                                  │
│           ▼                                     │
│  ┌──────────────────────────────────────────┐  │
│  │  MongoDB Database (via Mongoose)         │  │
│  │  ├─ Users Collection                     │  │
│  │  └─ Transactions Collection              │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
└─────────────────────────────────────────────────┘
```

## ⚙️ Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.2
- **Database**: MongoDB with Mongoose 9.3 ODM
- **Authentication**: JWT (jsonwebtoken 9.0)
- **Security**: bcryptjs (password hashing)
- **AI Integration**: @google/generative-ai (Gemini API)
- **Email**: Nodemailer 8.0
- **Development**: Nodemon (auto-restart)
- **Environment**: dotenv (configuration management)

## 📁 Project Structure

```
backend/
├── server.js                    # Main server entry point
├── seed.js                      # Database seeding script for demo data
├── package.json                 # Dependencies and scripts
├── .env                         # Environment variables (NOT in git)
├── .env.example                 # Template for .env
├── node_modules/                # Installed packages
│
├── controllers/                 # Business logic layer
│   ├── authController.js        # Login, Register, Password Reset
│   ├── transactionController.js # CRUD operations for transactions
│   └── advisorController.js     # AI coach logic & Gemini integration
│
├── models/                      # Database schemas
│   ├── User.js                  # User schema
│   └── Transaction.js           # Transaction schema
│
├── routes/                      # HTTP endpoint definitions
│   ├── authRoutes.js            # /api/auth/* endpoints
│   ├── transactionRoutes.js     # /api/transactions/* endpoints
│   ├── advisorRoutes.js         # /api/advisor/* endpoints
│   └── adminRoutes.js           # /api/admin/* endpoints
│
└── middleware/                  # Express middleware
    ├── authMiddleware.js        # JWT token verification
    └── roleMiddleware.js        # Role-based access control
```

## 🔑 Environment Variables

Create a `.env` file in the `backend/` directory. See `.env.example` for template.

```env
# Server Configuration
PORT=3001                          # Backend server port
NODE_ENV=development               # development/production

# Database
MONGO_URI=mongodb://127.0.0.1:27017/finance
# For production: mongodb+srv://user:password@cluster.mongodb.net/finance

# Authentication
JWT_SECRET=your_very_strong_256_bit_secret_key_here
# Generate with: openssl rand -base64 32

# Frontend Integration
FRONTEND_URL=http://localhost:5173
# For production: https://your-frontend-domain.com

# Google Gemini AI (Optional but recommended)
GEMINI_API_KEY=your_google_api_key_here

# Email Configuration (Optional - for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SERVICE=gmail
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
SMTP_SECURE=true
MAIL_FROM=FinTrack Pro <your_email@gmail.com>
```

## 🗄️ Database Models

### User Schema
```javascript
{
  _id: ObjectId,
  email: String (unique, lowercase),
  password: String (bcrypt-hashed),
  role: String (enum: ["user", "admin"]),
  resetToken: String (optional),
  resetTokenExpiry: Date (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Fields:**
- `email`: User's unique email address
- `password`: Hashed password (never stored in plain text)
- `role`: Determines access level (user can only access own transactions, admin can see all)
- `resetToken` + `resetTokenExpiry`: Used for password reset functionality

### Transaction Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (foreign key → User),
  amount: Number,
  description: String,
  category: String (enum: ["Food", "Salary", "Housing", "Transport", ...]),
  transactionType: String (enum: ["income", "expense"]),
  paymentMethod: String (enum: ["Cash", "Card", "UPI", ...]),
  date: Date,
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Fields:**
- `userId`: Links transaction to specific user
- `amount`: Numeric value (positive for both income and expense)
- `category`: Predefined financial categories for classification
- `transactionType`: Distinguishes between money in (income) and money out (expense)
- `paymentMethod`: How the transaction was made
- `date`: When the transaction occurred (not necessarily "today")

## 📡 API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints (`/api/auth`)

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "message": "User registered successfully"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "email": "user@example.com", "role": "user" }
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "message": "If an account with that email exists, a password reset link has been sent."
}

Note: Link is logged to console in development, sent via email in production
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "email": "user@example.com",
  "newPassword": "newPassword123"
}

Response: 200 OK
{
  "message": "Password reset successful. You can now login with your new password."
}
```

### Transaction Endpoints (`/api/transactions`)
*All require JWT authentication (Bearer token in Authorization header)*

#### Get All User Transactions
```http
GET /api/transactions
Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
[
  {
    "_id": "...",
    "amount": 500,
    "category": "Food",
    "transactionType": "expense",
    "date": "2024-04-01",
    ...
  },
  ...
]
```

#### Add Transaction
```http
POST /api/transactions/add
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "amount": 500,
  "description": "Grocery shopping",
  "category": "Food",
  "transactionType": "expense",
  "paymentMethod": "Card",
  "date": "2024-04-01"
}

Response: 201 Created
{
  "_id": "...",
  "userId": "...",
  "amount": 500,
  ...
}
```

#### Update Transaction
```http
PUT /api/transactions/:id
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "amount": 600,
  "category": "Groceries"
}

Response: 200 OK
{
  "_id": "...",
  "amount": 600,
  ...
}
```

#### Delete Transaction
```http
DELETE /api/transactions/:id
Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
{
  "message": "Transaction deleted"
}
```

#### Get Financial Summary
```http
GET /api/transactions/summary/me
Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
{
  "totalIncome": 50000,
  "totalExpense": 12000,
  "netBalance": 38000,
  "savingsRate": 76,
  "topCategories": [
    { "name": "Food", "amount": 5000 },
    { "name": "Transport", "amount": 3000 }
  ]
}
```

### AI Advisor Endpoints (`/api/advisor`)

#### Chat with AI Coach
```http
POST /api/advisor/chat
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "message": "How can I save more money?"
}

Response: 200 OK
{
  "reply": "Based on your spending patterns, I recommend following the 50/30/20 rule...",
  "context": {
    "savingsRate": 76,
    "topCategory": "Food",
    "recommendedSavings": 3800
  }
}
```

**AI Logic:**
1. Fetches user's transaction data
2. Calculates financial metrics (savings rate, income distribution)
3. Sends context to Google Gemini API with financial prompt
4. Returns personalized advice based on actual spending data

### Admin Endpoints (`/api/admin`)
*Requires admin role*

#### Get All Transactions (Admin)
```http
GET /api/admin/transactions
Authorization: Bearer <ADMIN_JWT_TOKEN>

Response: 200 OK
[
  { userId: "...", amount: 500, ... },
  { userId: "...", amount: 1200, ... }
]
```

## 🔐 Security Implementation

### 1. Password Security
- Passwords are hashed using bcryptjs with salt rounds = 10
- Plain passwords never stored in database
- Password reset tokens are time-limited (15 minutes)

### 2. JWT Authentication
- Tokens generated on login, expire after 24 hours
- Required for protected endpoints
- Verified by `authMiddleware` on each request

```javascript
// How JWT works:
1. User logs in with email/password
2. Server verifies password and generates JWT token
3. Client stores token in localStorage
4. For protected routes, client sends: Authorization: Bearer <token>
5. Server verifies token signature and expiration
6. If valid, user request is processed
```

### 3. Role-Based Access Control
- **User role**: Can only access own transactions
- **Admin role**: Can access all data
- Enforced by `roleMiddleware`

### 4. CORS Protection
- Whitelist of allowed frontend URLs
- Prevents unauthorized cross-origin requests

```javascript
const allowList = [
  "http://localhost:5173",       // Local dev
  "https://yourfrontend.com",    // Production
];
```

## 🤖 AI Advisor Implementation

The advisor works in two modes:

### Mode 1: With Google Gemini API (Recommended)
- Analyzes real transaction data
- Provides context-aware financial advice
- Uses financial prompt engineering

```javascript
// Example Gemini prompt:
"The user has income of ₹50,000 and expenses of ₹12,000 this month.
Their top spending category is Food (₹5,000).
Savings rate is 76%.
Provide specific, actionable financial advice using the 50/30/20 rule."
```

### Mode 2: Fallback (Without API Key)
- Returns pre-built financial guidance
- Uses 50/30/20 rule recommendations
- Suggests generic savings strategies

## 🚀 Getting Started

### Installation
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your values

# Start development server
npm run dev
```

### Seed Sample Data
```bash
# Populates MongoDB with demo transactions
node seed.js
```

### Production Build
```bash
# Start without nodemon (production mode)
npm run start
```

## 🧪 Testing the API

### Using cURL
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Add transaction (with JWT token)
curl -X POST http://localhost:3001/api/transactions/add \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount":500,
    "category":"Food",
    "transactionType":"expense",
    "paymentMethod":"Card",
    "date":"2024-04-01"
  }'
```

### Using Postman
1. Import the API endpoints into Postman
2. Set `{{token}}` variable from login response
3. Use tokens in Authorization header for protected routes

## 📊 Key Functions

### authController.js
- `register()` - Create new user account
- `login()` - Authenticate and return JWT
- `forgotPassword()` - Initiate password reset
- `resetPassword()` - Complete password reset

### transactionController.js
- `getTransactions()` - Fetch user's transactions with filtering
- `addTransaction()` - Create new transaction
- `updateTransaction()` - Modify existing transaction
- `deleteTransaction()` - Remove transaction
- `getSummary()` - Calculate financial metrics

### advisorController.js
- `chatAdvisor()` - Process user query and return AI advice
- `calculateUserStats()` - Compute savings rate, categories, etc.
- `buildFinancialPrompt()` - Create context-aware AI prompt

## 🔄 Request/Response Flow

```
1. Client sends request with JWT token
   └─► Authorization: Bearer eyJhbG...

2. authMiddleware validates token
   └─► Extracts userId from token payload

3. Route handler calls controller function
   └─► Business logic executes

4. Controller interacts with database
   └─► Mongoose queries MongoDB

5. Response formatted and sent back
   └─► 200 OK, 400 Bad Request, 401 Unauthorized, etc.

6. Client receives data and updates UI
```

## 🐛 Error Handling

The backend includes comprehensive error handling:

```javascript
// Endpoints return meaningful error responses:
400 Bad Request    - Invalid input data
401 Unauthorized   - Missing/invalid JWT token
403 Forbidden      - Insufficient permissions
404 Not Found      - Resource doesn't exist
500 Server Error   - Unexpected server issue
```

## 📈 Performance Optimizations

- JWT tokens avoid database queries for authentication
- Indexed database fields for faster queries
- CORS whitelist prevents unnecessary requests
- Error handler prevents server crashes
- Environment variables loaded once at startup

## 🚀 Deployment Considerations

### Production Environment
```env
NODE_ENV=production
PORT=3001 (or dynamic from deployment platform)
MONGO_URI=mongodb+srv://... (cloud database)
JWT_SECRET=<very_long_random_string>
FRONTEND_URL=https://yourdomain.com
```

### Deployment Platforms
- **Render.com** (Free tier available)
- **Railway.app** (Easy GitHub integration)
- **Heroku** (Traditional Node.js hosting)

For detailed deployment steps, see [DEPLOYMENT.md](../DEPLOYMENT.md)

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT Introduction](https://jwt.io/)
- [Google Generative AI API](https://ai.google.dev/)
