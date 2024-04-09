// cashDepositHandler.js

const cashDepositHandler = (app, connection) => {
  app.post('/cash/deposit', (req, res) => {
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
        UPDATE CashAccount
        SET balance = balance + ?
        WHERE accountNumberId = ?
      `, [amount, accountNumberId], (error, result) => {
        if (error) {
          return connection.rollback(() => {
            console.error('Error updating cash account balance:', error.message);
            res.status(500).json({ error: 'Internal Server Error' });
          });
        }

        connection.query(`
          INSERT INTO cashAccountTransactions (accountNumberId, transactionType, amount)
          VALUES (?, 'DEPOSIT', ?)
        `, [accountNumberId, amount], (err, result) => {
          if (err) {
            return connection.rollback(() => {
              console.error('Error recording deposit transaction:', err.message);
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
            
            res.json({ message: 'Deposit successful' });
          });
        });
      });
    });
  });
};

module.exports = cashDepositHandler;