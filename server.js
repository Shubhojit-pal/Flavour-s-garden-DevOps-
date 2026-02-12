// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./routes/index'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Flavour Garden API — Customer Backend' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await db.query('SELECT 1');
    console.log('MySQL connected ✓');
    app.listen(PORT, () => {
      console.log(`Server running → http://localhost:${PORT}`);
      console.log('API base → http://localhost:5000/api');
    });
  } catch (err) {
    console.error('Cannot connect to database:', err.message);
    process.exit(1);
  }
}

app.use(cors({
  origin: 'http://localhost:3000',   // ← Vite default port
  credentials: true
}));

start();