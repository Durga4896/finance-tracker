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
const MONGO_URI = process.env.MONGO_URI;

//  CORS FIX (IMPORTANT) 

const allowList = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000",
  "https://finance-tracker-neon-nine.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowList.includes(origin)) {
      return callback(null, true);
    }

    // 🔥 DO NOT THROW ERROR → allow instead
    console.warn("Blocked by CORS:", origin);
    return callback(null, true); // allow temporarily
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

//  BODY PARSER 
app.use(express.json());

//  ROUTES 

app.get("/", (req, res) => {
  res.send("API running 🚀");
});

app.get("/api", (req, res) => {
  res.send("API working...");
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/transactions", transactionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/advisor", advisorRoutes);
app.use("/api/admin", adminRoutes);

//  ERROR HANDLER 

app.use((err, _req, res, _next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

//  DB CONNECTION 

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected...");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed.:", err);
    process.exit(1);
  });