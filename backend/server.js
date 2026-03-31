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

//CORS CONFIG (

const allowList = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000",
  "https://finance-tracker-neon-nine.vercel.app"
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman)
    if (!origin) return callback(null, true);

    if (allowList.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); 

//   BODY PARSER

app.use(express.json());

//ROUTES

app.get("/", (req, res) => {
  res.send("API running 🚀");
});

app.get("/api", (req, res) => {
  res.send("API working...");
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use("/api/transactions", transactionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/advisor", advisorRoutes);
app.use("/api/admin", adminRoutes);


//ERROR HANDLER

app.use((err, _req, res, _next) => {
  console.error("ERROR:", err.message);
  res.status(500).json({ message: err.message || "Internal server error" });
});


// DB CONNECTION


mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected...");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed ❌:", err.message);
    process.exit(1);
  });