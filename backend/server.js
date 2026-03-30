import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import transactionRoutes from "./routes/transactionRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import advisorRoutes from "./routes/advisorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/finance";

const defaultOrigins = ["http://localhost:5173", "http://localhost:4173", "http://localhost:3000"];
const envOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
  : [];
const allowList = [...defaultOrigins, ...envOrigins];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowList.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true
  })
);

app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/transactions", transactionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/advisor", advisorRoutes);
app.use("/api/admin", adminRoutes);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || "Internal server error" });
});


mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`); // Line 59
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });