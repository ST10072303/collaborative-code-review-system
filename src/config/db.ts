import { Pool } from "pg";
import dotenv from "dotenv";

// Load variables from the .env file into process.env.
dotenv.config();

// A connection pool allows our application to reuse database connections instead of opening a completely new connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;