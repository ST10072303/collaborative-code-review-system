import app from "./app";
import pool from "./config/db";
import "./websocket";

// the port is read from the .env file.
const PORT = process.env.PORT || 3000;

// test the PostgreSQL database connection.
const testDatabaseConnection = async (): Promise<void> => {
  try {
   // send a simple SQL query to PostgreSQL.
  // SELECT NOW() asks PostgreSQL for the current date and time.
    
    const result = await pool.query("SELECT NOW()");

    console.log("Database connected successfully!");
    console.log("Database time:", result.rows[0].now);
  } catch (error) {
    // if PostgreSQL cannot be reached, the error will be caught here. 
    console.error("Database connection failed:", error);
  }
};

// start the Express server.
 app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

//test the database connection when the application starts.
 testDatabaseConnection();