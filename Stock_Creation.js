// stockCreation.js

const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

const connection = mysql.createConnection({
  host: "EC2AMAZ-H8DPT2R",
  user: "StockForgeDBAdmin",
  password: "StockForge Capstone2024!",
  database: "StockForge"
});

connection.connect();

// Route to handle stock creation
app.post('/stocks/create', (req, res) => {
  const { stocksName, companyName, stockTicker, price, volume } = req.body;

  // Insert data into Stocks table
  connection.query(`
    INSERT INTO Stocks (stocksName, companyName, stockTicker)
    VALUES (?, ?, ?)
  `, [stocksName, companyName, stockTicker], (error, results) => {
    if (error) {
      console.error('Error creating stock:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Insert data into Price table
    connection.query(`
      INSERT INTO Price (stocksName, value)
      VALUES (?, ?)
    `, [stocksName, price]);

    // Insert data into Volume table
    connection.query(`
      INSERT INTO Volume (stocksName, value)
      VALUES (?, ?)
    `, [stocksName, volume]);

    res.json({ message: 'Stock added successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

module.exports = app;