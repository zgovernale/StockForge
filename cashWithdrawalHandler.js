// cashWithdrawalHandler.js

const cashWithdrawalHandler = (app, connection) => {
  app.post('/cash/withdraw', (req, res) => {
    const { accountNumberId, amount } = req.body;

    if (!accountNumberId || !amount) {
      return res.status(400).json({ error: 'Account number ID and amount are required' });
    }

    connection.beginTransaction(err => {
      if (err) {
        console.error('Error beginning transaction:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      connection.query(`
        SELECT balance FROM CashAccount WHERE accountNumberId = ?
      `, [accountNumberId], (error, results) => {
        if (error) {
          return connection.rollback(() => {
            console.error('Error fetching cash account balance:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
          });
        }

        const currentBalance = results[0].balance;
        if (currentBalance < amount) {
          return connection.rollback(() => {
            res.status(400).json({ error: 'Insufficient balance' });
          });
        }

        connection.query(`
          UPDATE CashAccount
          SET balance = balance - ?
          WHERE accountNumberId = ?
        `, [amount, accountNumberId], (err, result) => {
          if (err) {
            return connection.rollback(() => {
              console.error('Error updating cash account balance:', err.message);
              res.status(500).json({ error: 'Internal Server Error' });
            });
          }

          connection.query(`
            INSERT INTO cashAccountTransactions (accountNumberId, transactionType, amount)
            VALUES (?, 'WITHDRAWAL', ?)
          `, [accountNumberId, amount], (err, result) => {
            if (err) {
              return connection.rollback(() => {
                console.error('Error recording withdrawal transaction:', err.message);
                res.status(500).json({ error: 'Internal Server Error' });
              });
            }

            connection.commit(err => {
              if (err) {
                return connection.rollback(() => {
                  console.error('Error committing transaction:', err.message);
                  res.status(500).json({ error: 'Internal Server Error' });
                });
              }
              
              res.json({ message: 'Withdrawal successful' });
            });
          });
        });
      });
    });
  });
};

module.exports = cashWithdrawalHandler;