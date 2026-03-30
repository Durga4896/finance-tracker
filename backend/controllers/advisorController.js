import { GoogleGenerativeAI } from "@google/generative-ai";
import Transaction from "../models/Transaction.js";

const INR = (value) => `Rs ${Math.round(value).toLocaleString("en-IN")}`;

const getKeywordAdvice = (message, stats) => {
  const text = message.toLowerCase();
  const tips = [];

  if (text.includes("save") || text.includes("savings")) {
    tips.push("Use auto-transfer: move 20% of income to savings on salary day.");
  }

  if (text.includes("food") || text.includes("swiggy") || text.includes("zomato")) {
    tips.push("Set a weekly food budget and track every food order to avoid small leaks.");
  }

  if (text.includes("budget") || text.includes("plan")) {
    tips.push(
      `Try 50/30/20 from this month: Needs ${INR(stats.income * 0.5)}, Wants ${INR(stats.income * 0.3)}, Savings ${INR(stats.income * 0.2)}.`
    );
  }

  if (text.includes("debt") || text.includes("loan") || text.includes("credit")) {
    tips.push("Prioritize highest-interest debt first while paying minimum on others.");
  }

  if (text.includes("invest") || text.includes("sip") || text.includes("mutual")) {
    tips.push("Build an emergency fund first, then start a monthly SIP with a fixed date.");
  }

  return tips;
};

export const chatAdvisor = async (req, res) => {
  try {
    const userId = req.user.id;
    const message = String(req.body.message || "").trim();

    if (!message) {
      return res.status(400).json({ message: "Please enter a question for the money coach." });
    }

    const transactions = await Transaction.find({ userId });

    if (!transactions.length) {
      return res.json({
        reply:
          "Start by adding 5-10 recent transactions. Then I can give personalized advice on saving, spending control, and monthly planning.",
        stats: {
          income: 0,
          expenses: 0,
          balance: 0,
          savingsRate: 0,
          topExpenseCategory: "N/A"
        }
      });
    }

    const income = transactions
      .filter((item) => Number(item.amount) > 0)
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = transactions
      .filter((item) => Number(item.amount) < 0)
      .reduce((sum, item) => sum + Math.abs(Number(item.amount)), 0);

    const balance = income - expenses;
    const savingsRate = income > 0 ? (balance / income) * 100 : 0;

    const expenseByCategory = transactions
      .filter((item) => Number(item.amount) < 0)
      .reduce((acc, item) => {
        const key = item.category || "Others";
        acc[key] = (acc[key] || 0) + Math.abs(Number(item.amount));
        return acc;
      }, {});

    const topExpenseCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    const stats = { income, expenses, balance, savingsRate, topExpenseCategory };

    let reply = "";

    if (process.env.GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
          You are an AI Money Coach in a financial tracking application. 
          The user has sent the following message: "${message}"

          Here is the user's current financial context:
          - Total Income: ${INR(income)}
          - Total Expenses: ${INR(expenses)}
          - Net Balance: ${INR(balance)}
          - Savings Rate: ${savingsRate.toFixed(1)}%
          - Top Expense Category: ${topExpenseCategory}

          Please provide a helpful, encouraging, and concise financial response based on their context and message. Provide action-oriented advice if applicable. Keep the language natural and use emojis appropriately. Keep your response brief, no more than exactly what the user needs.
        `;

        const result = await model.generateContent(prompt);
        reply = result.response.text();
      } catch (aiError) {
        console.error("Gemini AI API Error:", aiError.message);
      }
    }

    if (!reply) {
      const getDigitalAdvice = (message, stats, txs) => {
        const text = message.toLowerCase();
        const advice = [];
        
        // 1. Contextual Greetings
        if (text.match(/\b(hi|hello|hey|hlo)\b/)) {
          advice.push(`👋 **Hello!** I'm your Digital Money Coach. Currently tracking **${txs.length} transactions** for you.`);
          advice.push(`✨ Ready to analyze your **${stats.topExpenseCategory}** spending or check your **${INR(stats.balance)}** balance?`);
        }

        // 2. Data Queries
        if (text.includes("history") || text.includes("transaction")) {
          const last5 = txs.slice(-5).reverse();
          advice.push(`📋 **Recent Transactions:**\n` + last5.map(t => `- ${t.description}: **${INR(t.amount)}** (${t.category})`).join("\n"));
        } else if (text.includes("explain") || text.includes("analyze") || text.includes("summary") || text.includes("breakdown")) {
          const summary = Object.entries(expenseByCategory)
            .sort((a,b) => b[1] - a[1])
            .map(([cat, amt]) => `- **${cat}**: ${INR(amt)} (${((amt/expenses)*100).toFixed(1)}%)`)
            .join("\n");
          advice.push(`📊 **Spending Breakdown:**\n${summary || "No expenses found yet."}`);
        }

        // 3. Financial Coaching Logic
        if (text.includes("tip") || text.includes("save") || text.includes("saving")) {
          const tips = [
            `💡 **Savings Tip:** Since you spend the most on **${stats.topExpenseCategory}**, try a 'No-Spend Week' for that category!`,
            `💡 **Golden Rule:** Always aim to save at least **20%** of your income. Your current rate is **${stats.savingsRate.toFixed(1)}%**.`,
            `💡 **Auto-Save:** Set up a standing instruction to move **${INR(income * 0.1)}** to a separate account right on salary day.`
          ];
          advice.push(tips[Math.floor(Math.random() * tips.length)]);
        }

        if (text.includes("budget") || text.includes("plan")) {
          advice.push(`💰 **Budget Check:** Based on your **${INR(income)}** income, I recommend the 50/30/20 rule:`);
          advice.push(`- **Needs (50%):** ${INR(income * 0.5)}\n- **Wants (30%):** ${INR(income * 0.3)}\n- **Savings (20%):** ${INR(income * 0.2)}`);
          advice.push(`Currently, your 'Wants + Needs' are **${INR(expenses)}**.`);
        }

        if (text.includes("invest") || text.includes("sip") || text.includes("mutual")) {
          if (balance < 50000) {
            advice.push(`📈 **Investment Path:** Focus on building an **Emergency Fund** of at least **${INR(expenses * 3)}** first.`);
          } else {
            advice.push(`📈 **Investment Path:** You have a healthy balance! Start a monthly **SIP** in a diversified Nifty 50 Index Fund.`);
          }
        }

        // 4. Default Analysis if no query matches
        if (advice.length === 0) {
          if (stats.savingsRate < 20) {
            advice.push(`💡 **Focus on Growth:** Your savings rate is **${stats.savingsRate.toFixed(1)}%**. Let's try to find **${INR(income * 0.1)}** in monthly savings!`);
          } else {
            advice.push(`✅ **Healthy Finances:** You're doing great with a **${stats.savingsRate.toFixed(1)}%** savings rate. Ready for advanced investing?`);
          }
           advice.push(`📊 **Trend:** At this rate, you'll accumulate **${INR(balance * 12)}** in a year!`);
        }

        return advice;
      };

      const digitalAdvice = getDigitalAdvice(message, stats, transactions);
      
      reply = digitalAdvice.join("\n\n");
    }

    res.json({
      reply,
      stats: {
        income,
        expenses,
        balance,
        savingsRate: Number(savingsRate.toFixed(1)),
        topExpenseCategory
      }
    });
  } catch (_err) {
    res.status(500).json({ message: "Coach is unavailable right now. Please try again." });
  }
};
