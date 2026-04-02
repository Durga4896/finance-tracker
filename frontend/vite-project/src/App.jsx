import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart, Line, Area, AreaChart
} from "recharts";
import "./ModernApp.css";
import "./App.css";

//  API SETUP 
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// CONSTANTS 
const CATEGORIES = ["Food", "Salary", "Housing", "Transport", "Shopping", "Bills", "Health", "Education", "Entertainment", "Others"];
const PAYMENTS = ["Cash", "UPI", "Card", "Bank Transfer", "Wallet", "Net Banking"];
const SORT_OPTIONS = [
  { value: "latest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "amount_desc", label: "Amount: High → Low" },
  { value: "amount_asc", label: "Amount: Low → High" }
];

const CHART_COLORS = ["#6c63ff", "#00d9b9", "#ff5252", "#ffb74d", "#64b5f6", "#f06292", "#81c784", "#ff8a65"];

const TAB_CONFIG = [
  { key: "overview", label: "Dashboard", icon: "🏠" },
  { key: "transactions", label: "Transactions", icon: "📋" },
  { key: "add", label: "Add Entry", icon: "✚" },
  { key: "history", label: "Analytics", icon: "📊" },
  { key: "credited", label: "Income", icon: "📈" },
  { key: "debited", label: "Expenses", icon: "📉" },
  { key: "coach", label: "AI Coach", icon: "🤖" },
];

const TAB_KEYS = TAB_CONFIG.map((t) => t.key);

const formatINR = (v) => `₹${Math.abs(Number(v || 0)).toLocaleString("en-IN")}`;
const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const todayInput = () => new Date().toISOString().split("T")[0];
const readResetStateFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";
  const email = params.get("email") || "";
  const mode = params.get("mode");

  if (mode === "reset" && token && email) {
    return { screen: "reset", token, email };
  }

  return { screen: "login", token: "", email };
};

const clearResetSearchParams = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete("mode");
  url.searchParams.delete("token");
  url.searchParams.delete("email");

  const nextSearch = url.searchParams.toString();
  const nextUrl = `${url.pathname}${nextSearch ? `?${nextSearch}` : ""}${url.hash}`;
  window.history.replaceState(null, "", nextUrl);
};

const readHashTab = () => {
  const raw = window.location.hash.replace("#", "").trim().toLowerCase();
  return TAB_KEYS.includes(raw) ? raw : "overview";
};

// TOAST HOOK 
function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => t.id === id ? { ...t, removing: true } : t));
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 350);
    }, 3500);
  }, []);
  return { toasts, show };
}

//  TOAST UI 
function ToastContainer({ toasts }) {
  const icons = { success: "✅", error: "❌", info: "💡" };
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}${t.removing ? " removing" : ""}`}>
          <span className="toast-icon">{icons[t.type] || "💡"}</span>
          <span className="toast-msg">{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// CONFIRM MODAL
function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>⚠️ {title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="ghost-btn" style={{ width: "auto", padding: "10px 20px" }} onClick={onCancel}>Cancel</button>
          <button className="danger-btn" style={{ padding: "10px 20px", borderRadius: "var(--radius-sm)", fontSize: "0.88rem" }} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete = "current-password",
  readOnly = false
}) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <div className="password-input-wrap">
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          readOnly={readOnly}
          required
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          aria-pressed={visible}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

// CHANGE PASSWORD MODAL 
function ChangePasswordModal({ onClose, toast }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [visible, setVisible] = useState({ currentPassword: false, newPassword: false, confirmPassword: false });
  const [loading, setLoading] = useState(false);
  const toggleVisible = (key) => setVisible((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast("New passwords do not match.", "error"); return;
    }
    if (form.newPassword.length < 6) {
      toast("Password must be at least 6 characters.", "error"); return;
    }
    setLoading(true);
    try {
      const res = await api.post("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      toast(res.data.message || "Password changed!", "success");
      onClose();
    } catch (err) {
      toast(err.response?.data?.message || "Failed to change password.", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>🔒 Change Password</h3>
        <form className="password-form" onSubmit={handleSubmit}>
          {[
            ["currentPassword", "Current Password", "Enter current password", "current-password"],
            ["newPassword", "New Password", "Enter new password", "new-password"],
            ["confirmPassword", "Confirm New Password", "Re-enter new password", "new-password"]
          ].map(([key, label, placeholder, autoComplete]) => (
            <PasswordField
              key={key}
              id={key}
              label={label}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
              visible={visible[key]}
              onToggle={() => toggleVisible(key)}
              autoComplete={autoComplete}
            />
          ))}
          <div className="modal-actions" style={{ marginTop: 8 }}>
            <button type="button" className="ghost-btn" style={{ width: "auto", padding: "10px 20px" }} onClick={onClose}>Cancel</button>
            <button type="submit" className="primary-btn" style={{ width: "auto", padding: "10px 24px" }} disabled={loading}>
              {loading ? "Saving..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

//  AUTH SCREEN 
function AuthScreen({ onLogin, toast }) {
  const initialResetState = useMemo(() => readResetStateFromUrl(), []);
  const [screen, setScreen] = useState(initialResetState.screen);
  const [loading, setLoading] = useState(false);
  const [authForm, setAuthForm] = useState({ name: "", email: initialResetState.email || "", password: "" });
  const [forgotEmail, setForgotEmail] = useState(initialResetState.email || "");
  const [forgotNotice, setForgotNotice] = useState("");
  const [forgotPreviewUrl, setForgotPreviewUrl] = useState("");
  const [resetForm, setResetForm] = useState({
    email: initialResetState.email || "",
    token: initialResetState.token || "",
    newPassword: "",
    confirmPassword: ""
  });
  const [visible, setVisible] = useState({
    authPassword: false,
    resetPassword: false,
    resetConfirmPassword: false
  });

  const setScreenMode = (nextScreen) => {
    if (nextScreen !== "reset") clearResetSearchParams();
    if (nextScreen !== "forgot") {
      setForgotNotice("");
      setForgotPreviewUrl("");
    }
    setScreen(nextScreen);
  };

  const updAuth = (key, value) => setAuthForm((prev) => ({ ...prev, [key]: value }));
  const updReset = (key, value) => setResetForm((prev) => ({ ...prev, [key]: value }));
  const toggleVisible = (key) => setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  const openForgotPassword = () => {
    setForgotEmail(authForm.email);
    setScreenMode("forgot");
  };
  const backToLogin = (email = "") => {
    setScreenMode("login");
    setAuthForm((prev) => ({ ...prev, email: email || prev.email, password: "" }));
  };

  useEffect(() => {
    const syncResetState = () => {
      const nextState = readResetStateFromUrl();
      if (nextState.screen !== "reset") return;

      setScreen("reset");
      setAuthForm((prev) => ({ ...prev, email: nextState.email, password: "" }));
      setForgotEmail(nextState.email);
      setForgotNotice("");
      setForgotPreviewUrl("");
      setResetForm({
        email: nextState.email,
        token: nextState.token,
        newPassword: "",
        confirmPassword: ""
      });
    };

    syncResetState();
    window.addEventListener("popstate", syncResetState);
    return () => window.removeEventListener("popstate", syncResetState);
  }, []);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (!authForm.email || !authForm.password) {
      toast("Email and password are required.", "error");
      return;
    }

    setLoading(true);
    try {
      if (screen === "register") {
        await api.post("/auth/register", authForm);
        toast("Account created! Please sign in.", "success");
        backToLogin(authForm.email);
      } else {
        const res = await api.post("/auth/login", authForm);
        const loggedInUser = res.data.user || {};
        const nextRole = res.data.role || loggedInUser.role || "user";
        const nextName = res.data.name || loggedInUser.name || "";

        clearResetSearchParams();
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", nextRole);
        localStorage.setItem("userName", nextName);
        onLogin(nextRole, nextName);
      }
    } catch (err) {
      toast(err.response?.data?.message || "Authentication failed.", "error");
    } finally { setLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast("Email is required.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email: forgotEmail });
      setForgotNotice(res.data.message || "If an account with that email exists, a password reset link has been sent.");
      setForgotPreviewUrl(res.data.previewUrl || "");
      if (res.data.previewUrl) {
        toast("SMTP is not configured yet. The reset link was logged by the backend for local testing.", "info");
      } else {
        toast(res.data.message || "Password reset email sent.", "success");
      }
    } catch (err) {
      toast(err.response?.data?.message || "Failed to send reset email.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (resetForm.newPassword !== resetForm.confirmPassword) {
      toast("New passwords do not match.", "error");
      return;
    }

    if (resetForm.newPassword.length < 6) {
      toast("Password must be at least 6 characters.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", {
        email: resetForm.email,
        token: resetForm.token,
        newPassword: resetForm.newPassword
      });

      toast(res.data.message || "Password reset successful.", "success");
      setResetForm((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
      backToLogin(resetForm.email);
    } catch (err) {
      toast(err.response?.data?.message || "Failed to reset password.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💰</div>
          <span className="auth-logo-text">FinTrack Pro</span>
        </div>

        <h1>
          {screen === "login" && "Welcome back 👋"}
          {screen === "register" && "Create account"}
          {screen === "forgot" && "Forgot password"}
          {screen === "reset" && "Reset password"}
        </h1>
        <p className="subtext">
          {screen === "login" && "Sign in to your personal finance dashboard."}
          {screen === "register" && "Start tracking income and expenses intelligently."}
          {screen === "forgot" && "Enter your email address and we’ll send you a secure reset link."}
          {screen === "reset" && "Choose a new password for your account to get back in securely."}
        </p>

        {(screen === "login" || screen === "register") && (
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {screen === "register" && (
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="Your full name" value={authForm.name} onChange={(e) => updAuth("name", e.target.value)} />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={authForm.email} onChange={(e) => updAuth("email", e.target.value)} required />
            </div>
            <PasswordField
              id="auth-password"
              label="Password"
              placeholder="Min. 6 characters"
              value={authForm.password}
              onChange={(e) => updAuth("password", e.target.value)}
              visible={visible.authPassword}
              onToggle={() => toggleVisible("authPassword")}
              autoComplete={screen === "login" ? "current-password" : "new-password"}
            />
            {screen === "login" && (
              <button type="button" className="auth-link-btn" onClick={openForgotPassword}>
                Forgot password?
              </button>
            )}
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Please wait..." : screen === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </form>
        )}

        {screen === "forgot" && (
          <form className="auth-form" onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
              />
            </div>
            {forgotNotice && <p className="success-text auth-feedback">{forgotNotice}</p>}
            {forgotPreviewUrl && (
              <a className="auth-preview-link" href={forgotPreviewUrl}>
                Open Reset Page →
              </a>
            )}
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Sending link..." : "Send Reset Link →"}
            </button>
          </form>
        )}

        {screen === "reset" && (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={resetForm.email} readOnly />
            </div>
            <PasswordField
              id="reset-password"
              label="New Password"
              placeholder="Enter new password"
              value={resetForm.newPassword}
              onChange={(e) => updReset("newPassword", e.target.value)}
              visible={visible.resetPassword}
              onToggle={() => toggleVisible("resetPassword")}
              autoComplete="new-password"
            />
            <PasswordField
              id="reset-confirm-password"
              label="Confirm New Password"
              placeholder="Re-enter new password"
              value={resetForm.confirmPassword}
              onChange={(e) => updReset("confirmPassword", e.target.value)}
              visible={visible.resetConfirmPassword}
              onToggle={() => toggleVisible("resetConfirmPassword")}
              autoComplete="new-password"
            />
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? "Updating password..." : "Reset Password →"}
            </button>
          </form>
        )}

        {(screen === "login" || screen === "register") && (
          <button
            type="button"
            className="switch-btn"
            style={{ marginTop: 12 }}
            onClick={() => setScreenMode(screen === "login" ? "register" : "login")}
          >
            {screen === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        )}

        {screen === "forgot" && (
          <button
            type="button"
            className="switch-btn"
            style={{ marginTop: 12 }}
            onClick={() => backToLogin(forgotEmail)}
          >
            Back to sign in
          </button>
        )}

        {screen === "reset" && (
          <div className="auth-action-stack">
            <button type="button" className="switch-btn" onClick={() => { setForgotEmail(resetForm.email); setScreenMode("forgot"); }}>
              Request a new link
            </button>
            <button type="button" className="ghost-btn" onClick={() => backToLogin(resetForm.email)}>
              Back to sign in
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

// MAIN APP 
function App() {
  const { toasts, show: toast } = useToast();

  const [role, setRole] = useState(localStorage.getItem("role") || "user");
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "");
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem("token")));
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0, savingsRate: 0, count: 0, byCategory: {}, monthly: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ description: "", amount: "", type: "expense", category: "Food", paymentMethod: "UPI", date: todayInput() });

  const [filters, setFilters] = useState({ search: "", category: "All", paymentMethod: "All", sortBy: "latest", type: "all", from: "", to: "" });

  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([{ role: "assistant", text: "👋 Hi! I'm your AI Money Coach. Ask me anything about savings, budgets, spending reduction, or financial planning." }]);
  const chatEndRef = useRef(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  //  AI HELPERS 
  const formatMessage = (text) => {
    if (!text) return "";
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const clearChat = () => {
    setChatMessages([{ role: "assistant", text: "👋 Hi! I'm your AI Money Coach. Ready for a fresh start! Ask me anything about savings, budgets, or your transactions." }]);
  };

  // FETCH TRANSACTIONS 
  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category !== "All") params.category = filters.category;
      if (filters.paymentMethod !== "All") params.paymentMethod = filters.paymentMethod;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.type !== "all") params.type = filters.type;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const res = await api.get("/transactions/all", { params });
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      else toast(err.response?.data?.message || "Failed to load transactions.", "error");
    } finally { setLoading(false); }
  }, [filters]);

  // FETCH SUMMARY
  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.get("/transactions/summary");
      setSummary(res.data);
    } catch (_) { }
  }, []);

  useEffect(() => {
    if (isLoggedIn) { fetchTransactions(); fetchSummary(); }
  }, [fetchTransactions, fetchSummary, isLoggedIn]);

  // HASH TAB ROUTING 
  useEffect(() => {
    setActiveTab(readHashTab());
    const onHash = () => setActiveTab(readHashTab());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const goToTab = (key) => {
    if (!TAB_KEYS.includes(key)) return;
    setActiveTab(key);
    window.history.replaceState(null, "", `#${key}`);
  };

  //  SCROLL CHAT TO BOTTOM 
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  //  AUTH HANDLERS 
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setRole("user");
    setUserName("");
    setTransactions([]);
    setSummary({ income: 0, expenses: 0, balance: 0, savingsRate: 0, count: 0, byCategory: {}, monthly: [] });
    window.history.replaceState(null, "", "#overview");
    toast("Signed out successfully.", "info");
  };

  //  FORM HANDLERS 
  const resetForm = () => {
    setForm({ description: "", amount: "", type: "expense", category: "Food", paymentMethod: "UPI", date: todayInput() });
    setEditingId(null);
  };

  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount) { toast("Description and amount are required.", "error"); return; }
    const rawAmount = Math.abs(Number(form.amount));
    if (Number.isNaN(rawAmount) || rawAmount === 0) { toast("Enter a valid non-zero amount.", "error"); return; }
    const amount = form.type === "expense" ? -rawAmount : rawAmount;

    try {
      if (editingId) {
        await api.put(`/transactions/${editingId}`, { ...form, amount });
        toast("Transaction updated successfully.", "success");
      } else {
        await api.post("/transactions/add", { ...form, amount });
        toast("Transaction added successfully.", "success");
      }
      resetForm();
      fetchTransactions();
      fetchSummary();

      // Trigger Success Animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      goToTab("transactions");
    } catch (err) {
      toast(err.response?.data?.message || "Failed to save transaction.", "error");
    }
  };

  const handleStartEdit = (tx) => {
    setEditingId(tx._id);
    setForm({
      description: tx.description || "",
      amount: String(Math.abs(tx.amount ?? "")),
      type: tx.type || (Number(tx.amount) >= 0 ? "income" : "expense"),
      category: tx.category || "Others",
      paymentMethod: tx.paymentMethod || "UPI",
      date: tx.date ? tx.date.split("T")[0] : todayInput()
    });
    goToTab("add");
  };

  const handleDeleteRequest = (id) => setDeleteTarget(id);

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/transactions/${deleteTarget}`);
      toast("Transaction deleted.", "success");
      if (editingId === deleteTarget) resetForm();
      setDeleteTarget(null);
      fetchTransactions();
      fetchSummary();
    } catch (err) {
      toast(err.response?.data?.message || "Delete failed.", "error");
      setDeleteTarget(null);
    }
  };

  //  CSV EXPORT 
  const exportCSV = () => {
    if (!transactions.length) { toast("No transactions to export.", "info"); return; }
    const header = ["Description", "Type", "Amount (₹)", "Category", "Payment Method", "Date"];
    const rows = transactions.map((t) => [
      `"${t.description}"`,
      t.type,
      Math.abs(t.amount).toFixed(2),
      t.category,
      t.paymentMethod,
      formatDate(t.date)
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fintrack_transactions_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("CSV exported successfully! 📁", "success");
  };

  //  AI ADVISOR 
  const handleAdvisorSend = async (eOrMsg) => {
    if (eOrMsg && eOrMsg.preventDefault) eOrMsg.preventDefault();

    const msg = typeof eOrMsg === "string" ? eOrMsg : chatInput.trim();
    if (!msg || chatLoading) return;

    const newUserMsg = { role: "user", text: msg };
    setChatMessages((p) => [...p, newUserMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await api.post("/advisor/chat", { message: msg });
      setChatMessages((p) => [...p, { role: "assistant", text: res.data.reply }]);
    } catch (err) {
      console.error("Coach error:", err);
      setChatMessages((p) => [...p, { role: "assistant", text: "Coach is resting right now. Please try again later!" }]);
    } finally {
      setChatLoading(false);
      // Auto-scroll after a short delay to allow re-render
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  //  RESET FILTERS 
  const resetFilters = () => setFilters({ search: "", category: "All", paymentMethod: "All", sortBy: "latest", type: "all", from: "", to: "" });

  //  COMPUTED DATA 
  const creditedRows = useMemo(() => transactions.filter((t) => Number(t.amount) > 0), [transactions]);
  const debitedRows = useMemo(() => transactions.filter((t) => Number(t.amount) < 0), [transactions]);

  const categoryData = useMemo(() => {
    const map = {};
    transactions.filter((t) => Number(t.amount) < 0).forEach((t) => {
      const key = t.category || "Others";
      map[key] = (map[key] || 0) + Math.abs(Number(t.amount));
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const topCategory = categoryData[0] || null;

  //  ADMIN FETCH 
  const fetchAdminUsers = useCallback(async () => {
    try {
      const res = await api.get("/admin/users");
      setAdminUsers(res.data || []);
    } catch (_) { }
  }, []);

  useEffect(() => {
    if (isLoggedIn && role === "admin") fetchAdminUsers();
  }, [isLoggedIn, role, fetchAdminUsers]);

  //  FLASH CARD VALUES 
  const flashCards = TAB_CONFIG.map((t) => {
    const vals = {
      overview: formatINR(summary.balance),
      add: editingId ? "✏️ Editing" : "➕ Ready",
      history: `${categoryData.length} groups`,
      credited: formatINR(summary.income),
      debited: formatINR(summary.expenses),
      coach: `${chatMessages.length} msgs`,
      transactions: `${summary.count} records`
    };
    return { ...t, value: vals[t.key] };
  });

  const displayName = userName?.trim() || "Finance User";
  const userInitial = displayName.charAt(0).toUpperCase();

  //  TAB RENDERERS

  //  OVERVIEW 
  const renderOverview = () => (
    <section className="tab-panel">
      <div className="panel-grid">
        {/* Quick Insights */}
        <article className="panel" style={{ gridColumn: "1 / -1" }}>
          <h4><span className="ph-icon">📊</span> Quick Insights</h4>
          <div className="kv-row"><span>Top expense category</span><strong>{topCategory ? `${topCategory.name} — ${formatINR(topCategory.value)}` : "No expenses yet"}</strong></div>
          <div className="kv-row"><span>Total transactions</span><strong>{summary.count}</strong></div>
          <div className="kv-row"><span>Income entries</span><strong style={{ color: "var(--income-color)" }}>{creditedRows.length}</strong></div>
          <div className="kv-row"><span>Expense entries</span><strong style={{ color: "var(--expense-color)" }}>{debitedRows.length}</strong></div>
          <div className="kv-row"><span>Net balance</span><strong style={{ color: summary.balance >= 0 ? "var(--income-color)" : "var(--expense-color)" }}>{formatINR(summary.balance)}</strong></div>

          {/* AI Coach Quick Tip */}
          <div className="ai-insight-box" style={{ marginTop: 20, padding: 16, background: "rgba(108,99,255,0.08)", borderRadius: 12, border: "1px solid rgba(108,99,255,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: "1.2rem" }}>🤖</span>
              <strong style={{ fontSize: "0.85rem", color: "var(--primary-light)", letterSpacing: "0.05em", textTransform: "uppercase" }}>AI Coach Insight</strong>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-1)", fontStyle: "italic", lineHeight: 1.5 }}>
              {summary.savingsRate < 20
                ? `\"Your savings rate is ${summary.savingsRate}%. I recommend aiming for 20% by reviewing your top spending in ${topCategory?.name || 'various categories'}.\"`
                : summary.balance < 0
                  ? `\"You've spent more than your income this month. Let's look at your ${topCategory?.name || 'expenses'} to see where we can save!\"`
                  : `\"Great job! You're saving ${summary.savingsRate}% of your income. Ready to start an emergency fund or a new investment?\"`}
            </p>
            <button
              className="ghost-btn"
              style={{ marginTop: 12, width: "auto", padding: "6px 12px", fontSize: "0.75rem", border: "1px solid rgba(108,99,255,0.3)" }}
              onClick={() => goToTab("coach")}
            >
              Ask Coach for more tips →
            </button>
          </div>

          {/* Savings Rate Bar */}
          <div className="kv-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <span>Savings rate</span>
              <strong style={{ color: summary.savingsRate >= 20 ? "var(--income-color)" : "var(--warning)" }}>
                {summary.savingsRate}%
              </strong>
            </div>
            <div className="savings-bar-wrap" style={{ width: "100%" }}>
              <div className="savings-bar-track">
                <div
                  className="savings-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.max(0, summary.savingsRate))}%`,
                    background: summary.savingsRate >= 20
                      ? "linear-gradient(90deg, var(--income-color), #00b894)"
                      : summary.savingsRate >= 10
                        ? "linear-gradient(90deg, var(--warning), #ff9800)"
                        : "linear-gradient(90deg, var(--expense-color), #ff1744)"
                  }}
                />
              </div>
            </div>
          </div>
        </article>



        {/* Spending by Category */}
        {categoryData.length > 0 && (
          <article className="panel" style={{ gridColumn: "1 / -1" }}>
            <h4><span className="ph-icon">🏷️</span> Spending by Category</h4>
            <div className="category-chips">
              {categoryData.map((item, i) => (
                <div key={item.name} className="category-chip">
                  <span className="chip-dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  <span>{item.name}</span>
                  <strong style={{ color: "var(--text-1)" }}>{formatINR(item.value)}</strong>
                </div>
              ))}
            </div>
          </article>
        )}

        {/* Admin Users Panel */}
        {role === "admin" && adminUsers.length > 0 && (
          <article className="panel" style={{ gridColumn: "1 / -1" }}>
            <h4><span className="ph-icon">🛡️</span> Admin — All Users <span className="admin-badge">Admin Only</span></h4>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Role</th><th>Transactions</th><th>Total Income</th><th>Total Expenses</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((u) => (
                    <tr key={u._id}>
                      <td className="tx-desc">{u.name || "—"}</td>
                      <td>{u.email}</td>
                      <td><span className={`badge ${u.role === "admin" ? "" : "badge-cat"}`}>{u.role}</span></td>
                      <td>{u.txCount}</td>
                      <td><span className="income">{formatINR(u.totalIncome)}</span></td>
                      <td><span className="expense">{formatINR(u.totalExpenses)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        )}
      </div>
    </section>
  );

  //  ADD / EDIT 
  const renderAdd = () => (
    <section className="tab-panel">
      <div className="panel-grid">
        <article className="panel">
          <h4><span className="ph-icon">{editingId ? "✏️" : "➕"}</span> {editingId ? "Edit Transaction" : "Add Transaction"}</h4>
          <form className="tx-form" onSubmit={handleSaveTransaction}>
            {/* Type Toggle */}
            <div className="form-group">
              <label>Transaction Type</label>
              <div className="type-toggle">
                <button
                  type="button"
                  className={`type-btn ${form.type === "income" ? "active-income" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, type: "income" }))}
                >
                  📈 Income
                </button>
                <button
                  type="button"
                  className={`type-btn ${form.type === "expense" ? "active-expense" : ""}`}
                  onClick={() => setForm((p) => ({ ...p, type: "expense" }))}
                >
                  📉 Expense
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <input placeholder="e.g. Monthly salary, Grocery shopping…" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
            </div>

            <div className="form-group">
              <label>Amount (₹)</label>
              <input type="number" min="0.01" step="0.01" placeholder="Enter amount (positive)" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} required />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select value={form.paymentMethod} onChange={(e) => setForm((p) => ({ ...p, paymentMethod: e.target.value }))}>
                {PAYMENTS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} max={todayInput()} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
            </div>

            <button type="submit" className="primary-btn">{editingId ? "💾 Save Changes" : "➕ Add Transaction"}</button>
            {editingId && (
              <button type="button" className="ghost-btn" onClick={resetForm}>✕ Cancel Edit</button>
            )}
          </form>
        </article>

        {/* Filters Panel */}
        <article className="panel">
          <h4><span className="ph-icon">🔍</span> Smart Filters</h4>
          <div className="filters-row">
            <div className="form-group">
              <label>Search</label>
              <input placeholder="Search description…" value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))} />
            </div>

            <div className="form-group">
              <label>Type</label>
              <div className="filter-pill-row">
                {[["all", "All"], ["income", "Income"], ["expense", "Expense"]].map(([val, lbl]) => (
                  <button key={val} className={`filter-pill ${filters.type === val ? "active" : ""}`} onClick={() => setFilters((p) => ({ ...p, type: val }))}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Category</label>
              <select value={filters.category} onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}>
                <option value="All">All Categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Payment Method</label>
              <select value={filters.paymentMethod} onChange={(e) => setFilters((p) => ({ ...p, paymentMethod: e.target.value }))}>
                <option value="All">All Methods</option>
                {PAYMENTS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Sort By</label>
              <select value={filters.sortBy} onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value }))}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Date Range</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input type="date" value={filters.from} onChange={(e) => setFilters((p) => ({ ...p, from: e.target.value }))} />
                <input type="date" value={filters.to} onChange={(e) => setFilters((p) => ({ ...p, to: e.target.value }))} />
              </div>
            </div>

            <div className="filters-actions">
              <button className="ghost-btn" style={{ width: "auto", padding: "9px 18px" }} onClick={() => { resetFilters(); fetchTransactions(); }}>
                ✕ Reset Filters
              </button>
              <button className="primary-btn" style={{ width: "auto", padding: "9px 18px" }} onClick={fetchTransactions}>
                Apply Filters
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );

  //  HISTORY / CHARTS 
  const renderHistory = () => (
    <section className="tab-panel">
      <div className="charts-grid">
        <article className="panel chart-panel">
          <h4><span className="ph-icon">🍩</span> Expense Split by Category</h4>
          {categoryData.length === 0
            ? <div className="empty-state"><div className="empty-icon">📊</div><p>Add expense transactions to see the category chart.</p></div>
            : (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={110} paddingAngle={3}>
                      {categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ background: "#0f1f38", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#f0f4ff" }} />
                    <Legend wrapperStyle={{ color: "#a8b8d8", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
        </article>

        <article className="panel chart-panel">
          <h4><span className="ph-icon">📊</span> Monthly Income vs Expense</h4>
          {summary.monthly.length === 0
            ? <div className="empty-state"><div className="empty-icon">📅</div><p>Add transactions to see monthly trends.</p></div>
            : (
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.monthly} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" tick={{ fill: "#a8b8d8", fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fill: "#a8b8d8", fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ background: "#0f1f38", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#f0f4ff" }} />
                    <Legend wrapperStyle={{ color: "#a8b8d8", fontSize: 12 }} />
                    <Bar dataKey="income" name="Income" fill="#00e676" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expense" name="Expense" fill="#ff5252" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
        </article>

        <article className="panel chart-panel" style={{ gridColumn: "1 / -1" }}>
          <h4><span className="ph-icon">📈</span> Balance Trend Over Time</h4>
          {summary.monthly.length === 0
            ? <div className="empty-state"><div className="empty-icon">📈</div><p>Not enough data to display trend.</p></div>
            : (
              <div className="chart-wrap" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.monthly.map((m) => ({ ...m, balance: m.income - m.expense }))}>
                    <defs>
                      <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6c63ff" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6c63ff" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="month" tick={{ fill: "#a8b8d8", fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fill: "#a8b8d8", fontSize: 11 }} />
                    <Tooltip formatter={(v) => formatINR(v)} contentStyle={{ background: "#0f1f38", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#f0f4ff" }} />
                    <Area type="monotone" dataKey="balance" name="Balance" stroke="#6c63ff" fill="url(#balGrad)" strokeWidth={2} dot={{ fill: "#6c63ff" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
        </article>
      </div>
    </section>
  );

  //  SIMPLE TABLE (INCOME / EXPENSE) 
  const renderSimpleTable = (rows, type) => {
    const isIncome = type === "credited";
    return (
      <section className="tab-panel">
        <article className="panel table-panel">
          <div className="table-controls">
            <div>
              <h4 style={{ marginBottom: 4 }}><span className="ph-icon">{isIncome ? "📈" : "📉"}</span> {isIncome ? "Income Records" : "Expense Records"}</h4>
              <span className="table-count">{rows.length} record{rows.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
          {rows.length === 0
            ? <div className="empty-state"><div className="empty-icon">{isIncome ? "📈" : "📉"}</div><p>No {isIncome ? "income" : "expense"} records found.</p></div>
            : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Description</th><th>Amount</th><th>Category</th><th>Payment</th><th>Date</th></tr></thead>
                  <tbody>
                    {rows.map((tx) => (
                      <tr key={tx._id}>
                        <td className="tx-desc">{tx.description}</td>
                        <td className="amount-cell"><span className={isIncome ? "income" : "expense"}>{formatINR(tx.amount)}</span></td>
                        <td><span className="badge badge-cat">{tx.category}</span></td>
                        <td><span className="badge badge-pay">{tx.paymentMethod}</span></td>
                        <td>{formatDate(tx.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </article>
      </section>
    );
  };

  //  AI COACH 
  const renderCoach = () => (
    <section className="tab-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h4 style={{ margin: 0 }}><span className="ph-icon">🤖</span> AI Money Coach</h4>
        <button className="danger-btn" style={{ padding: "6px 12px", fontSize: "0.75rem" }} onClick={clearChat}>Clear Chat</button>
      </div>

      <article className="panel" style={{ padding: 0, background: "transparent", border: "none" }}>
        <div className="advisor-chat">
          <div className="chat-window">
            {chatMessages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role === "user" ? "user-bubble" : "assistant-bubble"}`}>
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {formatMessage(m.text)}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="chat-bubble assistant-bubble">
                <div className="typing-indicator">
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="category-chips" style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button className="filter-pill" onClick={() => handleAdvisorSend("Give me a money saving tip")}>💡 Saving Tip</button>
            <button className="filter-pill" onClick={() => handleAdvisorSend("Explain my spending breakdown")}>📊 Analyze Me</button>
            <button className="filter-pill" onClick={() => handleAdvisorSend("Show my recent history")}>📋 History</button>
            <button className="filter-pill" onClick={() => handleAdvisorSend("How is my budget looking?")}>💰 Budget Check</button>
          </div>

          <form className="chat-form" onSubmit={handleAdvisorSend}>
            <input
              placeholder="Ask about savings, budgets, or specific categories..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
            />
            <button className="chat-send-btn" type="submit" disabled={chatLoading || !chatInput.trim()}>
              {chatLoading ? "..." : "✈️"}
            </button>
          </form>
        </div>
      </article>
    </section>
  );

  //  ALL TRANSACTIONS TABLE 
  const renderTransactions = () => (
    <section className="tab-panel">
      <article className="panel table-panel">
        <div className="table-controls">
          <div>
            <h4 style={{ marginBottom: 4 }}><span className="ph-icon">📋</span> All Transactions</h4>
            <span className="table-count">{loading ? "Loading…" : `${transactions.length} record${transactions.length !== 1 ? "s" : ""}`}</span>
          </div>
          <button className="export-btn" onClick={exportCSV}>⬇️ Export CSV</button>
        </div>

        {loading
          ? <div className="empty-state"><div className="empty-icon" style={{ animation: "typingBounce 1s infinite" }}>⏳</div><p>Loading transactions…</p></div>
          : transactions.length === 0
            ? <div className="empty-state"><div className="empty-icon">📭</div><p>No transactions found. Try adjusting your filters or add your first record.</p></div>
            : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Category</th>
                      <th>Payment</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id}>
                        <td className="tx-desc">{tx.description}</td>
                        <td><span className={`badge ${Number(tx.amount) >= 0 ? "badge-income" : "badge-expense"}`}>{Number(tx.amount) >= 0 ? "↑ Income" : "↓ Expense"}</span></td>
                        <td className="amount-cell"><span className={Number(tx.amount) >= 0 ? "income" : "expense"}>{formatINR(tx.amount)}</span></td>
                        <td><span className="badge badge-cat">{tx.category}</span></td>
                        <td><span className="badge badge-pay">{tx.paymentMethod}</span></td>
                        <td style={{ whiteSpace: "nowrap" }}>{formatDate(tx.date)}</td>
                        <td>
                          <div className="action-bar">
                            <button className="secondary-btn" onClick={() => handleStartEdit(tx)}>✏️ Edit</button>
                            <button className="danger-btn" onClick={() => handleDeleteRequest(tx._id)}>🗑️ Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
      </article>
    </section>
  );

  //  RENDER ACTIVE TAB 
  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "add": return renderAdd();
      case "history": return renderHistory();
      case "credited": return renderSimpleTable(creditedRows, "credited");
      case "debited": return renderSimpleTable(debitedRows, "debited");
      case "coach": return renderCoach();
      case "transactions": return renderTransactions();
      default: return renderOverview();
    }
  };

  //  AUTH GATE 
  if (!isLoggedIn) {
    return (
      <>
        <ToastContainer toasts={toasts} />
        <AuthScreen onLogin={(r, n) => { setRole(r); setUserName(n); setIsLoggedIn(true); goToTab("overview"); }} toast={toast} />
      </>
    );
  }

  //  MAIN DASHBOARD 
  return (
    <>
      <ToastContainer toasts={toasts} />

      {deleteTarget && (
        <ConfirmModal
          title="Delete Transaction"
          message="Are you sure you want to permanently delete this transaction? This action cannot be undone."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} toast={toast} />
      )}

      <div className="dashboard">
        {/* Success Overlay */}
        {showSuccess && (
          <div className="tx-success-overlay">
            <div className="success-pop">✨ Transaction Saved!</div>
          </div>
        )}

        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-brand">
            <div className="brand-icon">💰</div>
            <div className="brand-copy">
              <p className="kicker">Personal Finance Workspace</p>
              <div className="brand-title-row">
                <h2>FinTrack Pro</h2>
                <span className="brand-status">Live</span>
              </div>
              <p className="brand-subtitle">
                Track spending, review insights, and manage your account from one clean workspace.
              </p>
            </div>
          </div>

          <div className="top-actions">
            <div className="account-card">
              <div className="account-avatar">{userInitial}</div>
              <div className="user-info">
                <div className="user-meta-row">
                  <span className="user-greeting">Signed in as</span>
                  <span className={`role-badge ${role}`}>{role === "admin" ? "ADMIN" : "USER"}</span>
                </div>
                <div className="user-name">{displayName}</div>
              </div>
            </div>
            <div className="topbar-buttons">
              <button className="topbar-btn" title="Change Password" onClick={() => setShowChangePassword(true)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Password
              </button>
              <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
            </div>
          </div>
        </header>

        {/* Summary Cards */}
        <section className="summary-grid">
          <article className="summary-card balance">
            <div className="s-icon">💰</div>
            <div className="s-label">Net Balance</div>
            <div className="s-value">{formatINR(summary.balance)}</div>
          </article>
          <article className="summary-card income">
            <div className="s-icon">📈</div>
            <div className="s-label">Total Income</div>
            <div className="s-value">{formatINR(summary.income)}</div>
          </article>
          <article className="summary-card expenses">
            <div className="s-icon">📉</div>
            <div className="s-label">Total Expenses</div>
            <div className="s-value">{formatINR(summary.expenses)}</div>
          </article>
          <article className="summary-card records">
            <div className="s-icon">🗂️</div>
            <div className="s-label">Records</div>
            <div className="s-value">{summary.count}</div>
            <div className="savings-bar-wrap" style={{ marginTop: 8 }}>
              <div className="savings-bar-track">
                <div className="savings-bar-fill" style={{ width: `${Math.min(100, summary.savingsRate)}%`, background: "linear-gradient(90deg, var(--accent), var(--primary))" }} />
              </div>
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-3)", marginTop: 4 }}>Savings rate: {summary.savingsRate}%</div>
          </article>
        </section>

        {/* Flash Tab Navigation */}
        <section className="flash-grid">
          {flashCards.map((card) => (
            <button
              key={card.key}
              type="button"
              className={`flash-card ${activeTab === card.key ? "flash-card-active" : ""}`}
              onClick={() => goToTab(card.key)}
            >
              <span className="flash-icon">{card.icon}</span>
              <span className="flash-title">{card.label}</span>
              <span className="flash-subtitle">{card.subtitle}</span>
              <span className="flash-value">{card.value}</span>
            </button>
          ))}
        </section>

        <div className="active-tab-badge">
          📍 Current View: {TAB_CONFIG.find((t) => t.key === activeTab)?.label}
        </div>

        {/* Active Tab Content */}
        {renderActiveTab()}
      </div>
    </>
  );
}

export default App;
