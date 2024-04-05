const express = require('express');
const mysql = require('mysql2');
const startPortfolioHistoryService = require('./startPortfolioHistoryService');
const buyStockHandler = require('./buyStock');
const sellStockHandler = require('./sellStock');
const cashDepositHandler = require('./cashDeposit');
const cashWithdrawalHandler = require('./cashWithdrawal');

const app = express();
const port = 3000;

const connection = mysql.createConnection({
  host: "EC2AMAZ-H8DPT2R",
  user: "StockForgeDBAdmin",
  password: "StockForge Capstone2024!",
  database: "StockForge"
});

connection.connect();

// Call the function to start the portfolio history service
startPortfolioHistoryService(app, connection);

// Import and use the buyStockHandler
buyStockHandler(app, connection);

// Import and use the sellStockHandler
sellStockHandler(app, connection);

// Import and use the route handlers for cash deposit and withdrawal
cashDepositHandler(app, connection);
cashWithdrawalHandler(app, connection);

let isFetchingStockData = false;

app.get('/start', (req, res) => {
  isFetchingStockData = true;
  res.send('Data fetching started');
});

app.get('/stop', (req, res) => {
  isFetchingStockData = false;
  res.send('Data fetching stopped');
});

function fetchStockData() {
  connection.query(`
    SELECT 
      s.stockTicker, 
      p.value AS price, 
      v.value AS volume, 
      (p.value * v.value) AS market_capitalization, 
      s.dailyHigh, 
      s.dailyLow 
    FROM 
      Stocks s 
      INNER JOIN Price p ON s.stocksName = p.stocksName 
      INNER JOIN Volume v ON s.stocksName = v.stocksName
  `, (error, results, fields) => {
    if (!error) {
      console.log('Stock data:', results);
    }
  });
}

setInterval(() => {
  if (isFetchingStockData) {
    console.log('Fetching stock data...');
  }
}, 5000);

app.get('/stocks', (req, res) => {
  const { page } = req.query;
  const pageNumber = parseInt(page) || 1;
  const rowsPerPage = 10;
  const startIndex = (pageNumber - 1) * rowsPerPage;

  connection.query(`
    SELECT 
      s.stockTicker, 
      p.value AS price, 
      v.value AS volume, 
      (p.value * v.value) AS market_capitalization, 
      s.dailyHigh, 
      s.dailyLow 
    FROM 
      Stocks s 
      INNER JOIN Price p ON s.stocksName = p.stocksName 
      INNER JOIN Volume v ON s.stocksName = v.stocksName
    LIMIT ?, ?
  `, [startIndex, rowsPerPage], (error, results, fields) => {
    if (!error) {
      res.json(results);
    }
  });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});