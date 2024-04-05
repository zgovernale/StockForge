// startPortfolioHistoryService.js

function startPortfolioHistoryService(app, connection) {
  const port = 3000;

  app.get('/portfolio', (req, res) => {
    const accountNumberId = req.query.accountNumberId;
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;
    const offset = (page - 1) * pageSize;

    connection.query(`
      SELECT 
        Stocks.stocksName, 
        Stocks.companyName, 
        Stocks.stockTicker, 
        Price.value AS price_value, 
        Volume.value AS volume_value
      FROM 
        Portfolio
        JOIN Stocks ON Portfolio.stocksName = Stocks.stocksName
        JOIN Price ON Portfolio.stocksName = Price.stocksName
        JOIN Volume ON Portfolio.stocksName = Volume.stocksName
      WHERE 
        Portfolio.accountNumberId = ?
      LIMIT ?, ?
    `, [accountNumberId, offset, pageSize], (error, results, fields) => {
      res.json(results);
    });
  });

  app.get('/transactions', (req, res) => {
    const accountNumberId = req.query.accountNumberId;
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;
    const offset = (page - 1) * pageSize;

    connection.query(`
      (SELECT 
        'Stock' AS transactionCategory,
        stocksName,
        transactionType, 
        amount,
        transactionDate
      FROM 
        stockTransactions
      WHERE 
        accountNumberId = ?)
      UNION ALL
      (SELECT 
        'Cash' AS transactionCategory,
        NULL AS stocksName,
        transactionType, 
        amount,
        transactionDate
      FROM 
        cashAccountTransactions
      WHERE 
        accountNumberId = ?)
      ORDER BY transactionDate DESC
      LIMIT ?, ?
    `, [accountNumberId, accountNumberId, offset, pageSize], (error, results, fields) => {
      res.json(results);
    });
  });

  app.listen(port, () => {
    console.log(`Portfolio history service listening at http://localhost:${port}`);
  });
}

module.exports = startPortfolioHistoryService;