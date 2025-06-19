// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const Transaction = require('./models/Transaction');
const app = express();
app.use(express.json()); //To parse incoming JSON
app.use(cors());

app.get('/', (req, res) => {
  res.send('API is working!');
});
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));
  
//Starting with the API Routes
app.post("/api/transactions" , async (req , res) =>
{
    try{
        const transaction = new Transaction(req.body) //Helps in creating new document
        await transaction.save(); //This saves to MongoDB
        res.status(201).json(transaction);
    } catch(error)
      {
        res.status(400).json({error: error.message});
      }
});

// Get all transactions (GET /api/transactions)
app.get("/api/transactions" , async (req, res) => {
    try{
        const transactions = await Transaction.find().sort({date: -1}); 
        res.json(transactions);
    }
    catch(error){
        res.status(500).json({error: error.message})
    }
});
// Delete single transaction (DELETE /api/transactions/:id)
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ 
      message: 'Transaction deleted successfully',
      deletedTransaction: transaction 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server Error',
      details: error.message 
    });
  }
});

// Delete all transactions (DELETE /api/transactions)
app.delete('/api/transactions', async (req, res) => {
  try {
    const result = await Transaction.deleteMany({});
    res.json({ 
      message: `Deleted ${result.deletedCount} transactions`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server Error',
      details: error.message 
    });
  }
});

// Delete incomplete transactions (DELETE /api/transactions/incomplete)
app.delete('/api/transactions/incomplete', async (req, res) => {
  try {
    const result = await Transaction.deleteMany({ 
      $or: [
        { description: { $exists: false } },
        { description: '' },
        { amount: { $exists: false } },
        { amount: 0 },
        { category: { $exists: false } },
        { category: '' },
        { type: { $exists: false } },
        { type: '' },
      ],
    });
    res.json({ 
      message: `Deleted ${result.deletedCount} incomplete transactions`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server Error',
      details: error.message 
    });
  }
});

// 📊 Analytics Endpoint (Add this after all other routes)
app.get('/api/analytics', async (req, res) => {
  try {
    const results = await Transaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          income: {
            $sum: { 
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0 ] 
            } 
          },
          expenses: { 
            $sum: { 
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0 ] 
            } 
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } } // Sort chronologically
    ]);
    res.json(results);
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to generate analytics" });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => 
  console.log(`Server running on port ${PORT}`)
);
