import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";

// app will be responsible for handling HTTP requests.
const app = express();

// allow the API to receive requests from different origins.
app.use(cors());

// allow Express to read JSON data sent in request bodies.
app.use(express.json());

// authentication routes
app.use("/api/auth", authRoutes);

// test route.
app.get("/", (req, res) => {
  res.json({message: "Collaborative Code Review API is running!"});
});

export default app;