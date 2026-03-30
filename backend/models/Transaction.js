import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, default: "Others" },
    paymentMethod: { type: String, default: "UPI" },
    tags: { type: [String], default: [] },
    userId: { type: String, required: true, index: true },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);