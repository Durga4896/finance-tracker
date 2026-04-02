# FinTrack Pro — Frontend 🎨

A modern, high-performance financial dashboard built with **React 19** and **Vite**, featuring a premium **Glassmorphic** design system. The frontend provides an intuitive interface for tracking finances and receiving AI-powered financial advice.

## 📐 Design Philosophy

### Glassmorphism Design System
Glassmorphism is a modern UI design trend that combines:
- **Frosted glass effect**: Semi-transparent, blurred backgrounds
- **Depth layers**: Multiple layers with varying opacity
- **Smooth edges**: Rounded corners for friendliness
- **Subtle shadows**: Depth without heaviness
- **Bright accents**: Neon-like colors (purple, cyan, pink)

### Why Vanilla CSS?
- **Zero Framework Overhead**: No heavy CSS libraries
- **Maximum Performance**: Direct browser rendering
- **Full Control**: Custom animations and micro-interactions
- **Learning Value**: Pure CSS demonstrates deep web knowledge
- **Fast Load Times**: Minimal bundle size

## 🏗️ Frontend Architecture

```
┌──────────────────────────────────────────────────┐
│           React Application (Vite)               │
├──────────────────────────────────────────────────┤
│                                                   │
│  ┌────────────────────────────────────────────┐ │
│  │  App.jsx (Main Component & State)          │ │
│  │  • Tab management (routing)                 │ │
│  │  • Login/Auth state                        │ │
│  │  • Global transaction state                │ │
│  └────────────────────────────────────────────┘ │
│           │                                      │
│  ┌────────┴──────────────────────────────────┐  │
│  │         UI Components                      │  │
│  ├─ Dashboard Overview                       │  │
│  ├─ Transaction List & Filters               │  │
│  ├─ Add Transaction Form                     │  │
│  ├─ Analytics & Charts (Recharts)            │  │
│  ├─ AI Coach Chat Interface                  │  │
│  └─ Login/Register Screen                    │  │
│           │                                      │
│  ┌────────┴──────────────────────────────────┐  │
│  │         API Layer (Axios)                  │  │
│  │  • HTTP requests to backend                │  │
│  │  • JWT token management                    │  │
│  │  • Error handling                          │  │
│  └────────────────────────────────────────────┘  │
│           │                                      │
│  ┌────────┴──────────────────────────────────┐  │
│  │    Express Backend API (port 3001)        │  │
│  └────────────────────────────────────────────┘  │
│                                                   │
└──────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
frontend/vite-project/
├── package.json                      # Dependencies and scripts
├── vite.config.js                    # Vite bundler configuration
├── index.html                        # HTML entry point
├── .env                              # Production API URL
├── .env.example                      # Environment template
├── .env.development.local            # Local dev API URL
├── eslint.config.js                  # Code quality rules
│
├── src/
│   ├── main.jsx                      # React DOM entry point
│   ├── App.jsx                       # Main application component
│   ├── Login.jsx                     # Authentication screen
│   │
│   ├── App.css                       # Main component styles
│   ├── ModernApp.css                 # Glassmorphic design system
│   ├── index.css                     # Global styles
│   │
│   └── assets/                       # Static resources
│       ├── react.svg
│       └── vite.svg
│
└── public/                           # Static files served as-is
    └── dashboard_preview.png         # Screenshot (optional)
```

## 🔧 Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.4 | UI library for component-based development |
| **Vite** | 8.0.1 | Lightning-fast build tool and dev server |
| **Vanilla CSS** | - | Custom styling (no Tailwind, Bootstrap, etc.) |
| **Recharts** | 3.8.0 | React charting library for data visualization |
| **Axios** | 1.13.6 | HTTP client for API requests |
| **React Router** | (tab-based) | Tab-based navigation (no route library) |
| **ESLint** | 9.39.4 | Code quality and consistency |
| **Babel** | 7.29.0 | JavaScript transpilation |

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Backend API running on http://localhost:3001
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

```bash
# Navigate to frontend directory
cd frontend/vite-project

# Install dependencies
npm install

# Start development server
npm run dev

# Application opens at http://localhost:5173
```

### Build for Production

```bash
# Create optimized production bundle
npm run build
# Creates dist/ folder with bundled assets

# Preview production build locally
npm run preview
# Simulates production environment
```

### Code Quality

```bash
# Run ESLint to check code quality
npm run lint
```

## 🎯 Component Structure

### 1. Main Application (App.jsx)

**Purpose**: Central hub managing all state and navigation

**Key Features**:
- Tab-based navigation system
- User authentication state
- Transaction data management
- API integration with Axios

**States Managed**:
```javascript
- currentTab: String (which view is active)
- isLoggedIn: Boolean (authentication status)
- transactions: Array (list of user transactions)
- token: String (JWT for API authentication)
- formData: Object (transaction form input)
- selectedTransaction: Object (for editing)
- sortBy: String (transaction sort option)
```

**Tabs**:
| ID | Label | Icon | Purpose |
|----|-------|------|---------|
| overview | Dashboard | 🏠 | Financial summary & overview |
| transactions | Transactions | 📋 | View all transactions |
| add | Add Entry | ✚ | Create new transaction |
| history | Analytics | 📊 | Visual charts and graphs |
| credited | Income | 📈 | Income transactions only |
| debited | Expenses | 📉 | Expense transactions only |
| coach | AI Coach | 🤖 | Chat with money advisor |

### 2. Authentication (Login.jsx)

**Features**:
- User registration
- User login
- Error handling
- Form validation
- JWT token storage

**Flow**:
```
1. User enters email and password
2. Submits to /api/auth/register or /api/auth/login
3. Backend returns JWT token (on success)
4. Token stored in localStorage
5. User redirected to main app
6. Token included in all API requests
```

**Security**:
- Passwords sent to backend (never stored in frontend)
- JWT token stored securely in localStorage
- API calls include Authorization header

### 3. Dashboard View

**Components**:
- **Balance Card**: Shows net balance in large format
- **Quick Stats**: Income, Expenses, Savings Rate
- **Recent Transactions**: Latest 5 transactions
- **Quick Insights**: Top spending categories
- **Visual Summary**: Category-wise pie chart

**Data Calculated**:
```javascript
const totalIncome = calculations.income;
const totalExpense = calculations.expense;
const netBalance = totalIncome - totalExpense;
const savingsRate = (netBalance / totalIncome * 100).toFixed(2);
```

### 4. Transactions View

**Features**:
- List all transactions
- Filter by type (income/expense)
- Sort (newest, oldest, amount high→low)
- Edit/Delete buttons
- Category badges
- Amount color-coded (green for income, red for expense)

**Edit Functionality**:
`PUT /api/transactions/:id` with updated data

**Delete Functionality**:
`DELETE /api/transactions/:id` removes permanently

### 5. Add Transaction Form

**Fields**:
```javascript
{
  amount: numeric,
  description: text,
  category: dropdown,
  transactionType: radio (income/expense),
  paymentMethod: dropdown,
  date: date picker
}
```

**Validation**:
- All fields required
- Amount must be positive number
- Date cannot be in future

**Success Feedback**:
- ✨ Success animation
- Toast notification
- Auto-clear form
- Transaction added to list

### 6. Analytics & Charts

**Charts Implemented**:
1. **Bar Chart**: Monthly income vs expenses
2. **Pie Chart**: Category-wise spending breakdown
3. **Area Chart**: Cumulative balance over time
4. **Line Chart**: Daily spending trend

**Data Visualization**:
- Uses Recharts for responsive charts
- Auto-scales based on data
- Interactive tooltips on hover
- Color-coded by category

### 7. AI Money Coach (Coach.jsx)

**Features**:
- Chat interface with AI
- Quick action chips:
  - 📜 View Transaction History
  - 💰 Budget Check
  - 💡 Savings Tips
  - 📊 Category Analysis
- Message history display
- AI contextual responses

**How It Works**:
1. User types financial question
2. Sends to `/api/advisor/chat`
3. Backend:
   - Calculates user's financial metrics
   - Sends context to Gemini API
   - Returns personalized advice
4. Response displayed in chat

## 🎨 Styling & Design System

### CSS Files

#### ModernApp.css (Glassmorphic Design)
Contains all premium design elements:

```css
/* Glassmorphic Cards */
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 20px;
}

/* Color Palette */
--primary: #6c63ff      /* Purple */
--accent: #00d9b9       /* Cyan */
--danger: #ff5252       /* Red */
--warning: #ffb74d      /* Orange */

/* Animations */
.fade-in { opacity: 0 → 1 }
.slide-down { transform: translateY(-20px) → 0 }
.bounce { scale: 0.9 → 1 }
```

#### App.css
Component-specific styles for layouts and responsive behavior

#### index.css
Global styles: fonts, colors, resets

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary Purple | #6c63ff | Buttons, headers, accents |
| Accent Cyan | #00d9b9 | Highlights, success states |
| Danger Red | #ff5252 | Delete, expense, warnings |
| Warning Orange | #ffb74d | Caution, secondary actions |
| Info Blue | #64b5f6 | Information, highlights |
| Success Green | #81c784 | Income, positive metrics |

### Animations

```css
/* Success Animation */
@keyframes success-bounce {
  0%: scale(0.5), opacity(0)
  50%: scale(1.1)
  100%: scale(1), opacity(1)
}

/* Smooth Tab Transitions */
.tab-content {
  opacity: 0 → 1
  transition: 300ms ease-in-out
}

/* Hover Effects */
.interactive-element:hover {
  transform: translateY(-2px)
  box-shadow: enhanced
}
```

## 🌐 API Integration

### Axios Configuration

```javascript
// Base URL from environment variables
const API_BASE = import.meta.env.VITE_API_BASE_URL || 
                 "http://localhost:3001/api";

const api = axios.create({ baseURL: API_BASE });

// Auto-attach JWT token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Calls Used

```javascript
// Authentication
POST /auth/register
POST /auth/login
POST /auth/forgot-password
POST /auth/reset-password

// Transactions
GET /transactions
POST /transactions/add
PUT /transactions/:id
DELETE /transactions/:id
GET /transactions/summary/me

// AI Coach
POST /advisor/chat
```

## 📊 Data Flow

```
User Input
    ↓
Event Handler (onClick, onChange, onSubmit)
    ↓
State Update (setFormData, setTransactions, etc.)
    ↓
API Call (axios.post/get/put/delete)
    ↓
Backend Processing
    ↓
Response received
    ↓
Update component state
    ↓
Component re-renders with new data
    ↓
User sees updated UI
```

## 🔒 Security Features

1. **JWT Token Management**
   - Stored in localStorage after login
   - Included in every API request
   - Removed on logout

2. **Password Safety**
   - Never displayed in forms while typing
   - Always sent over HTTPS in production
   - Never stored in frontend

3. **API Security**
   - CORS-protected backend
   - Token verification on each request
   - HTTPS enforcement in production

## 📱 Responsive Design

The app is optimized for:
- **Minimum**: 1024px width (tablet landscape)
- **Optimal**: 1360px+ (desktop)
- **Large**: 2560px+ (4K displays)

**Layout Strategy**:
- Tab navigation adapts to screen size
- Cards use flexible grid layout
- Charts scale responsively
- Forms stack on smaller screens

## ⚡ Performance Optimizations

1. **Code Splitting**: Lazy load components when needed
2. **Memoization**: useCallback/useMemo for expensive computations
3. **Debouncing**: Limit API calls during rapid input
4. **Caching**: Store user data to minimize requests
5. **CSS Optimization**: Minified in production build

## 🛠️ Development Workflow

### Hot Module Replacement
Vite provides instant hot updates during development:
- Edit a component → Instantly see changes
- No full page reload needed
- State preserved during edits

### Debugging
```javascript
// Console logging
console.log("Transaction data:", transactions);

// React Dev Tools Browser Extension
// Inspect component props and state
```

### Environment Variables

**Development** (.env.development.local):
```env
VITE_API_BASE_URL=http://127.0.0.1:3001/api
```

**Production** (.env):
```env
VITE_API_BASE_URL=https://your-backend-api.com/api
```

## 🚀 Deployment

### Build Process
```bash
npm run build
# Creates optimized dist/ folder with:
# - Minified JavaScript
# - Optimized CSS
# - Compressed images
# - Source maps (for debugging)
```

### Deployment Platforms

**Vercel** (Recommended):
```bash
npm install -g vercel
vercel --prod
```

**Netlify**:
1. Connect GitHub repo
2. Set build command: `npm run build`
3. Set publish directory: `dist`

## 📚 Dependencies Explained

| Package | Purpose |
|---------|---------|
| **react** | UI component library |
| **react-dom** | React rendering engine |
| **axios** | HTTP requests to backend |
| **recharts** | React charting library |
| **vite** | Build tool & dev server |
| **@vitejs/plugin-react** | React support in Vite |
| **eslint** | Code quality checking |
| **babel** | JavaScript transpilation |

## 🎓 Key Learning Outcomes

This frontend demonstrates:
- Modern React patterns (hooks, state management)
- CSS mastery (animations, layout, responsive design)
- API integration and data fetching
- User authentication flows
- Data visualization techniques
- Performance optimization
- Production-ready code quality

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Ensure backend is running on port 3001
- Check VITE_API_BASE_URL environment variable
- Verify CORS settings on backend

### "Token expired" errors
- Clear localStorage and re-login
- Check JWT_SECRET matches between frontend/backend

### Styling issues
- Clear browser cache (Cmd+Shift+R)
- Check CSS file is imported in main.jsx

## 📖 Further Reading

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/)
- [Axios Documentation](https://axios-http.com/)
- [Recharts Documentation](https://recharts.org/)
- [Glassmorphism Design](https://glassmorphism.com/)

---

**Built with ❤️ for financial empowerment**
