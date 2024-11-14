import React, { useState } from 'react';
import './Expenses.css';

function Expenses() {
  const [showForm, setShowForm] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    paidBy: '',
    splitBetween: [],
    group: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newExpense = {
      ...expenseData,
      id: Date.now(),
      amount: parseFloat(expenseData.amount)
    };
    setExpenses([...expenses, newExpense]);
    setShowForm(false);
    setExpenseData({
      description: '',
      amount: '',
      paidBy: '',
      splitBetween: [],
      group: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="expenses-container">
      <h2>Expenses</h2>
      
      {/* Expenses List */}
      <div className="expenses-list">
        {expenses.length === 0 ? (
          <p>No expenses yet. Add one to get started!</p>
        ) : (
          expenses.map(expense => (
            <div key={expense.id} className="expense-card">
              <div className="expense-header">
                <h3>{expense.description}</h3>
                <span className="expense-amount">${expense.amount.toFixed(2)}</span>
              </div>
              <div className="expense-details">
                <p>Paid by: {expense.paidBy}</p>
                <p>Date: {new Date(expense.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Add Expense Button/Form */}
      {!showForm ? (
        <button 
          className="add-expense-btn"
          onClick={() => setShowForm(true)}
        >
          + Add New Expense
        </button>
      ) : (
        <form className="expense-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Description:</label>
            <input
              type="text"
              value={expenseData.description}
              onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
              placeholder="e.g., Dinner at Restaurant"
              required
            />
          </div>

          <div className="form-group">
            <label>Amount:</label>
            <input
              type="number"
              value={expenseData.amount}
              onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Paid By:</label>
            <input
              type="text"
              value={expenseData.paidBy}
              onChange={(e) => setExpenseData({...expenseData, paidBy: e.target.value})}
              placeholder="Enter name"
              required
            />
          </div>

          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              value={expenseData.date}
              onChange={(e) => setExpenseData({...expenseData, date: e.target.value})}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">Add Expense</button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Expenses; 