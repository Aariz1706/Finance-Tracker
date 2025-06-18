import React, { useEffect, useState } from "react";
import "./FinanceTracker.css";

function App() {
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error(err));
  }, []);

  const handleAddTransaction = (e) => {
    e.preventDefault();
    fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, type, category, description }),
    })
      .then((res) => res.json())
      .then((newTransaction) => {
        setTransactions([newTransaction, ...transactions]);
        setAmount(0);
        setType("");
        setCategory("");
        setDescription("");
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="finance-tracker">
      <h1>Finance Tracker</h1>
      <form className="transaction-form" onSubmit={handleAddTransaction}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          required
        />
        <select value={type} onChange={(e) => setType(e.target.value)} required>
          <option value="">Select Type</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit">Add Transaction</button>
      </form>

      <ul className="transaction-list">
        {transactions.map((transaction) => (
          <li key={transaction._id} className="transaction-item">
            <span className="transaction-description">
              {transaction.description || "No description"}
            </span>
            <span className="transaction-amount">
              {transaction.type === "expense" ? "-" : "+"}${transaction.amount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
