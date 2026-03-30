import express from "express";
import { chatAdvisor } from "../controllers/advisorController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", authMiddleware, chatAdvisor);

export default router;
