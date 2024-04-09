#####StockForge#####
#####Governale, Fillipitch, Boardman#####
#####IFT 401, Capstone####

import os
import mysql.connector
import random
import time
import requests
from datetime import datetime, timedelta
from decimal import Decimal

# Get the Node.js server hostname from the environment variable
node_server_hostname = os.getenv('NODE_SERVER_HOSTNAME')

# Start signal to Node.js server
requests.get(f'http://{node_server_hostname}/start')

# Connect to the database
conn = mysql.connector.connect(
    host="EC2AMAZ-H8DPT2R",
    user="StockForgeDBAdmin",
    password="StockForge Capstone2024!",
    database="StockForge"
)

#Create a cursor object to execute SQL queries
with conn.cursor() as cursor:
        # SQL Query to retrieve stock information from multiple tables to set starting prices
        retrieve_stocks = """
                SELECT s.stocksName, s.stockTicker, s.dailyHigh, s.dailyLow, s.openingPrice, p.value AS price_value
                FROM Stocks s
                LEFT JOIN Price p ON s.stocksName = p.stocksName
        """

        # Retrieve stocks from the database
        cursor.execute(retrieve_stocks)
        stocks = cursor.fetchall()
        
        # Update each stock value for start
        for stock in stocks:
                stocksName = stock[0]
                stockTicker = stock[1]
                price_value = stock[2]
                dailyHigh = stock[3]
                dailyLow = stock[4]
            
                # Set the opening price from the previous night's price
                openingPrice = price_value
                cursor.execute("UPDATE Stocks SET openingPrice = %s WHERE stocksName = %s", (openingPrice, stocksName))
            
                # Set the high price and low price to the opening price
                cursor.execute("UPDATE Stocks SET dailyHigh = %s, dailyLow = %s WHERE stockTicker = %s", (openingPrice, openingPrice, stockTicker))
    
        # Commit the changes for opening price
        conn.commit()

# Define the start time
start_time = datetime.now()

# Duration for running the script (6.5 hours at a time)
duration = timedelta(hours=6, minutes=30)

# Continuous execution for 6.5 hours
while datetime.now() - start_time < duration:
    with conn.cursor() as cursor:
        # SQL Query to retrieve stock information from multiple tables to update prices
        update_stocks = """
                SELECT s.stocksName, s.stockTicker, p.value AS stock_value, s.dailyHigh, s.dailyLow
                FROM Stocks s
                JOIN Price p ON s.stocksName = p.stocksName
        """
    
        # Retrieve stocks from the database
        cursor.execute(update_stocks)
        stocks = cursor.fetchall()

        # Update each stock value randomly
        for stock in stocks:
                stocksName = stock[0]
                stockTicker = stock[1]
                price_value = stock[2]
                dailyHigh = stock[3]
                dailyLow = stock[4]
                
                # Convert Decimal value to Float
                value_float = float(price_value)

                # Adjust the value randomly by +/- 0.055 cents
                new_value = round(value_float + random.uniform(-0.055, 0.055), 3)

                # Convert the new value back to Decimal
                new_value = Decimal(str(new_value))

                # Update the high price of the day
                if new_value > dailyHigh:
                        dailyHigh = new_value
                    
                # Update the low price of the day
                if new_value < dailyLow:
                        dailyLow = new_value

                # Update the value in the database
                cursor.execute("UPDATE Price SET value = %s WHERE stocksName = %s", (new_value, stocksName))

                conn.commit()

                cursor.execute("UPDATE Stocks SET dailyHigh = %s, dailyLow =%s WHERE stockTicker = %s", (dailyHigh, dailyLow, stockTicker))

                # Commit the changes
                conn.commit()
        
        # Wait for five seconds before the next iteration
        time.sleep(5)
        
# Close the connection
conn.close()

# Termination signal to Node.js server
requests.get(f'http://{node_server_hostname}/stop')