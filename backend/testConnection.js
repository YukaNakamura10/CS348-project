// testConnection.js
require('dotenv').config();
const oracledb = require('oracledb');
const path = require('path');


// Connection details for Oracle Cloud Database
const dbConfig = {
    user: "ADMIN",
    password: "NFujpdd2yWU35#Y",
    connectString: "(description= (retry_count=20)(retry_delay=3)(address=(protocol=tcps)(port=1521)(host=adb.us-ashburn-1.oraclecloud.com))(connect_data=(service_name=gc4d0c172a72aea_cs348_high.adb.oraclecloud.com))(security=(ssl_server_dn_match=yes)))"
};

async function testConnection() {
  let connection;
  try {
    // Establishing the connection
    connection = await oracledb.getConnection(dbConfig);

    console.log("Connected to Oracle Cloud database successfully!");

    // Optionally, run a simple query to confirm the connection
    const result = await connection.execute("SELECT 1 FROM dual");
    console.log("Test query result:", result.rows);

  } catch (err) {
    console.error("Error connecting to Oracle Cloud database:", err);
  } finally {
    if (connection) {
      try {
        // Close the connection
        await connection.close();
        console.log("Connection closed.");
      } catch (err) {
        console.error("Error closing the connection:", err);
      }
    }
  }
}

// Run the connection test
testConnection();
