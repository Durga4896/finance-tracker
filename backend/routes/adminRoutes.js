import express from "express";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// GET /api/admin/users  — admin only: list all users with transaction stats
router.get("/users", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();

    const enriched = await Promise.all(
      users.map(async (user) => {
        const txCount = await Transaction.countDocuments({ userId: user._id });
        const income = await Transaction.aggregate([
          { $match: { userId: String(user._id), type: "income" } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const expenses = await Transaction.aggregate([
          { $match: { userId: String(user._id), type: "expense" } },
          { $group: { _id: null, total: { $sum: { $abs: "$amount" } } } }
        ]);
        return {
          ...user,
          txCount,
          totalIncome: income[0]?.total || 0,
          totalExpenses: expenses[0]?.total || 0
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

export default router;
