// stockCreation.js

// Route handler function for stock creation
function createStock(req, res, connection) {
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
}

module.exports = createStock;