const express = require('express');
const cors = require('cors');
const { Database } = require('duckdb-async');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

// Initialize DuckDB
const initializeDatabase = async () => {
  const db = await Database.create('expenses.db');

  // Create tables with more features
  await db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      email VARCHAR UNIQUE,
      password VARCHAR,
      name VARCHAR,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY,
      name VARCHAR,
      description TEXT,
      category VARCHAR,
      created_by INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY,
      group_id INTEGER,
      user_id INTEGER,
      join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY,
      group_id INTEGER,
      description VARCHAR,
      amount DECIMAL(10,2),
      paid_by INTEGER,
      date DATE,
      category VARCHAR,
      receipt_url VARCHAR,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (paid_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS expense_splits (
      id INTEGER PRIMARY KEY,
      expense_id INTEGER,
      user_id INTEGER,
      amount DECIMAL(10,2),
      status VARCHAR DEFAULT 'pending',
      settled_at TIMESTAMP,
      FOREIGN KEY (expense_id) REFERENCES expenses(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS settlements (
      id INTEGER PRIMARY KEY,
      payer_id INTEGER,
      receiver_id INTEGER,
      amount DECIMAL(10,2),
      group_id INTEGER,
      status VARCHAR DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      settled_at TIMESTAMP,
      FOREIGN KEY (payer_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id),
      FOREIGN KEY (group_id) REFERENCES groups(id)
    );
  `);

  return db;
};

let db;
(async () => {
  db = await initializeDatabase();
})();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, name]
    );

    const token = jwt.sign({ id: result[0].id }, JWT_SECRET);
    res.json({ token, userId: result[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email = $1', [email]);

    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.json({ token, userId: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Group routes
app.post('/api/groups', authenticateToken, async (req, res) => {
  try {
    const { name, description, category, members } = req.body;
    
    const result = await db.run(
      `INSERT INTO groups (name, description, category, created_by) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [name, description, category, req.user.id]
    );
    
    const groupId = result[0].id;

    // Add creator as member
    await db.run(
      'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
      [groupId, req.user.id]
    );

    // Add other members
    for (const memberId of members) {
      await db.run(
        'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
        [groupId, memberId]
      );
    }

    res.json({ success: true, groupId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Expense routes with advanced features
app.post('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const { groupId, description, amount, category, date, splits } = req.body;
    
    // Start transaction
    await db.run('BEGIN TRANSACTION');

    // Create expense
    const expenseResult = await db.run(
      `INSERT INTO expenses (group_id, description, amount, paid_by, category, date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [groupId, description, amount, req.user.id, category, date]
    );
    
    const expenseId = expenseResult[0].id;

    // Create splits
    for (const split of splits) {
      await db.run(
        `INSERT INTO expense_splits (expense_id, user_id, amount)
         VALUES ($1, $2, $3)`,
        [expenseId, split.userId, split.amount]
      );
    }

    await db.run('COMMIT');
    res.json({ success: true, expenseId });
  } catch (error) {
    await db.run('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

// Settlement routes
app.post('/api/settlements', authenticateToken, async (req, res) => {
  try {
    const { groupId, payerId, receiverId, amount } = req.body;
    
    const result = await db.run(
      `INSERT INTO settlements (payer_id, receiver_id, group_id, amount)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [payerId, receiverId, groupId, amount]
    );

    res.json({ success: true, settlementId: result[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Balance calculation
app.get('/api/groups/:groupId/balances', authenticateToken, async (req, res) => {
  try {
    const balances = await db.all(`
      WITH expense_totals AS (
        SELECT 
          e.paid_by,
          es.user_id as ower,
          SUM(es.amount) as amount
        FROM expenses e
        JOIN expense_splits es ON e.id = es.expense_id
        WHERE e.group_id = $1
        GROUP BY e.paid_by, es.user_id
      )
      SELECT 
        u1.name as payer,
        u2.name as ower,
        SUM(amount) as balance
      FROM expense_totals et
      JOIN users u1 ON et.paid_by = u1.id
      JOIN users u2 ON et.ower = u2.id
      GROUP BY u1.id, u2.id, u1.name, u2.name
      HAVING SUM(amount) > 0
    `, [req.params.groupId]);

    res.json(balances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 