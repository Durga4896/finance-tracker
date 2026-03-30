import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Transaction from "./models/Transaction.js";

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/finance");
        console.log("Connected to MongoDB for seeding...");

        const user = await User.findOne();
        if (!user) {
            console.error("No user found in the database. Please register a user first.");
            process.exit(1);
        }

        console.log(`Seeding data for user: ${user.email} (ID: ${user._id})`);

        const transactions = [
            { userId: user._id, description: "Monthly Salary", amount: 120000, type: "income", category: "Salary", paymentMethod: "Bank Transfer", date: new Date() },
            { userId: user._id, description: "Apartment Rent", amount: -35000, type: "expense", category: "Housing", paymentMethod: "Bank Transfer", date: new Date(new Date().setDate(new Date().getDate() - 25)) },
            { userId: user._id, description: "Groceries & Kitchen", amount: -12000, type: "expense", category: "Food", paymentMethod: "UPI", date: new Date(new Date().setDate(new Date().getDate() - 20)) },
            { userId: user._id, description: "New Smartphone", amount: -25000, type: "expense", category: "Shopping", paymentMethod: "Card", date: new Date(new Date().setDate(new Date().getDate() - 15)) },
            { userId: user._id, description: "Fuel & Commute", amount: -8000, type: "expense", category: "Transport", paymentMethod: "UPI", date: new Date(new Date().setDate(new Date().getDate() - 10)) },
            { userId: user._id, description: "Internet & Electricity", amount: -5500, type: "expense", category: "Bills", paymentMethod: "Bank Transfer", date: new Date(new Date().setDate(new Date().getDate() - 5)) },
            { userId: user._id, description: "Weekend Movie & Dinner", amount: -4500, type: "expense", category: "Entertainment", paymentMethod: "UPI", date: new Date(new Date().setDate(new Date().getDate() - 1)) },
            { userId: user._id, description: "Freelance Project Bonus", amount: 15000, type: "income", category: "Salary", paymentMethod: "Wallet", date: new Date() }
        ];

        // Clear existing transactions to avoid clutter if needed
        // await Transaction.deleteMany({ userId: user._id });

        await Transaction.insertMany(transactions);
        console.log("Successfully seeded 8 realistic transactions! 🚀");

        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seed();
