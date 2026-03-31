import Transaction from "../models/Transaction.js";

//  ADD TRANSACTION 
export const addTransaction = async (req, res) => {
  try {
    const { description, amount, category, paymentMethod, tags, date } = req.body;
    const numAmount = Number(amount);

    if (!description || Number.isNaN(numAmount)) {
      return res.status(400).json({ message: "Description and valid amount are required." });
    }

    const newTransaction = new Transaction({
      description,
      amount: numAmount,
      type: numAmount >= 0 ? "income" : "expense",
      category: category || "Others",
      paymentMethod: paymentMethod || "UPI",
      tags: Array.isArray(tags) ? tags : [],
      userId: req.user.id,
      date: date ? new Date(date) : new Date()
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(500).json({ message: "Failed to add transaction." });
  }
};

//  GET TRANSACTIONS (with server-side filter/sort/search) 
export const getTransactions = async (req, res) => {
  try {
    const { search, category, paymentMethod, sortBy, from, to, type } = req.query;

    const query = { userId: req.user.id };

    // Type filter
    if (type && type !== "all") {
      query.type = type;
    }

    // Category filter
    if (category && category !== "All") {
      query.category = category;
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== "All") {
      query.paymentMethod = paymentMethod;
    }

    // Date range filter
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.date.$lte = toDate;
      }
    }

    // Text search on description
    if (search && search.trim()) {
      query.description = { $regex: search.trim(), $options: "i" };
    }

    // Sorting
    let sortConfig = { date: -1 }; // default: latest first
    if (sortBy === "amount_desc") sortConfig = { amount: -1 };
    if (sortBy === "amount_asc") sortConfig = { amount: 1 };
    if (sortBy === "oldest") sortConfig = { date: 1 };

    const transactions = await Transaction.find(query).sort(sortConfig);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch transactions." });
  }
};

//  GET SUMMARY 
export const getSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id });

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

    const balance = income - expenses;
    const savingsRate = income > 0 ? Math.max(0, (balance / income) * 100) : 0;

    // By category (expenses only)
    const byCategory = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => {
        const key = t.category || "Others";
        acc[key] = (acc[key] || 0) + Math.abs(Number(t.amount));
        return acc;
      }, {});

    // Monthly trend (last 6 months)
    const monthlyMap = {};
    transactions.forEach((t) => {
      const key = new Date(t.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      if (!monthlyMap[key]) monthlyMap[key] = { month: key, income: 0, expense: 0 };
      if (t.type === "income") monthlyMap[key].income += Number(t.amount);
      else monthlyMap[key].expense += Math.abs(Number(t.amount));
    });
    const monthly = Object.values(monthlyMap).slice(-6);

    res.json({
      income,
      expenses,
      balance,
      savingsRate: Number(savingsRate.toFixed(1)),
      count: transactions.length,
      byCategory,
      monthly
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch summary." });
  }
};

//  UPDATE TRANSACTION 
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    const isOwner = String(transaction.userId) === String(req.user.id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Access denied" });

    const numAmount = Number(req.body.amount ?? transaction.amount);

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      {
        description: req.body.description ?? transaction.description,
        amount: numAmount,
        type: numAmount >= 0 ? "income" : "expense",
        category: req.body.category ?? transaction.category,
        paymentMethod: req.body.paymentMethod ?? transaction.paymentMethod,
        tags: req.body.tags ?? transaction.tags,
        date: req.body.date ? new Date(req.body.date) : transaction.date
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

//  DELETE TRANSACTION 
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: "Transaction not found" });

    const isOwner = String(transaction.userId) === String(req.user.id);
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) return res.status(403).json({ message: "Access denied" });

    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};
