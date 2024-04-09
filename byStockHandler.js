// buyStockHandler.js

const buyStockHandler = (app, connection) => {
  app.post('/buy-stock', (req, res) => {
    const { accountNumberId, stockTicker, volume } = req.body;

    connection.query(`
      SELECT p.value AS price_value
      FROM Price p
      JOIN Stocks s ON p.stocksName = s.stocksName
      WHERE s.stockTicker = ?
    `, [stockTicker], (error, results, fields) => {
      if (results.length === 0) {
        return res.status(404).json({ error: 'Stock not found' });
      }

      const price = results[0].price_value;
      const totalPrice = price * volume;

      connection.query(`
        SELECT balance
        FROM CashAccounts
        WHERE accountNumberId = ?
      `, [accountNumberId], (error, results, fields) => {
        if (results.length === 0) {
          return res.status(404).json({ error: 'Cash account not found' });
        }

        const balance = results[0].balance;

        if (balance < totalPrice) {
          return res.status(400).json({ error: 'Insufficient balance' });
        }

        const newBalance = balance - totalPrice;

        connection.query(`
          UPDATE CashAccounts
          SET balance = ?
          WHERE accountNumberId = ?
        `, [newBalance, accountNumberId], (error, results, fields) => {
          if (error) {
            return res.status(500).json({ error: 'Internal Server Error' });
          }

          connection.query(`
            INSERT INTO stockTransactions (accountNumberId, stocksName, transactionType, amount)
            VALUES (?, ?, 'BUY', ?)
          `, [accountNumberId, stockTicker, volume], (error, results, fields) => {
            if (error) {
              return res.status(500).json({ error: 'Internal Server Error' });
            }

            return res.json({ message: 'Stock purchased successfully' });
          });
        });
      });
    });
  });
};

module.exports = buyStockHandler;