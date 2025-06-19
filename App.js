import React, { useState, useEffect } from 'react';
import './FinanceTracker.css';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Calculate totals
  const totals = transactions.reduce((acc, transaction) => {
    acc[transaction.type] += transaction.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const netBalance = totals.income - totals.expense;

  // Fetch transactions
  useEffect(() => {
    fetch('/api/transactions')
      .then(res => res.json())
      .then(data => setTransactions(data));
  }, []);

  // Add transaction
  const handleAddTransaction = (e) => {
    e.preventDefault();
    const newTransaction = {
      amount: Number(amount),
      type,
      category,
      description,
      date: new Date()
    };
    
    fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTransaction),
    })
      .then(res => res.json())
      .then(data => {
        setTransactions([data, ...transactions]);
        setAmount('');
        setCategory('');
        setDescription('');
      });
  };

  // NEW: Delete single transaction
  const handleDeleteTransaction = async (id) => {
    setIsDeleting(true);
    try {
      await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      setTransactions(transactions.filter(t => t._id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // NEW: Reset all transactions
  const handleResetAll = async () => {
    if (window.confirm("Are you sure you want to delete ALL transactions?")) {
      try {
        await fetch('/api/transactions', { method: 'DELETE' });
        setTransactions([]);
      } catch (err) {
        console.error("Failed to reset:", err);
      }
    }
  };

  return (
    <div className="finance-app">
      <h1>Finance Tracker</h1>
      
      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>Total Income</h3>
          <p className="income">${totals.income}</p>
        </div>
        <div className="card">
          <h3>Total Expenses</h3>
          <p className="expense">${totals.expense}</p>
        </div>
        <div className="card">
          <h3>Net Balance</h3>
          <p className={netBalance >= 0 ? "income" : "expense"}>
            ${Math.abs(netBalance)}
          </p>
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className="add-transaction">
        <h2>Add Transaction</h2>
        <form onSubmit={handleAddTransaction}>
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="form-actions">
            <button type="submit">Add Transaction</button>
            <button
              type="button"
              onClick={handleResetAll}
              className="reset-btn"
            >
              Reset All
            </button>
          </div>
        </form>
      </div>

      {/* Transactions List */}
      <div className="transactions">
        <h2>Recent Transactions</h2>
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction._id} className={transaction.type}>
              <div className="transaction-info">
                <span className="category">{transaction.category}</span>
                <span className="description">{transaction.description}</span>
                <span className="date">
                  {new Date(transaction.date).toLocaleDateString()}
                </span>
              </div>
              <div className="transaction-actions">
                <span className="amount">
                  {transaction.type === "expense" ? "-" : "+"}${transaction.amount}
                </span>
                <button 
                  onClick={() => handleDeleteTransaction(transaction._id)}
                  className="delete-btn"
                  disabled={isDeleting}
                  aria-label="Delete transaction"
                >
                  {isDeleting ? "..." : "×"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
