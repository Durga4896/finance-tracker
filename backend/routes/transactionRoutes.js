import express from "express";
import {
  addTransaction,
  getTransactions,
  getSummary,
  updateTransaction,
  deleteTransaction
} from "../controllers/transactionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.post("/add", authMiddleware, addTransaction);
router.get("/all", authMiddleware, getTransactions);
router.get("/summary", authMiddleware, getSummary);
router.put("/:id", authMiddleware, updateTransaction);
router.delete("/:id", authMiddleware, deleteTransaction);

export default router;
