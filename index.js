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
const PORT = process.env.PORT || 5000;
// Delete incomplete transactions
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
    res.json({ message: `Deleted ${result.deletedCount} incomplete transactions.` });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));