import express from "express";
import cors from "cors";

// app will be responsible for handling HTTP requests.
const app = express();

// allow the API to receive requests from different origins.
app.use(cors());

// allow Express to read JSON data sent in request bodies.
app.use(express.json());

// test route.
app.get("/", (req, res) => {
  res.json({message: "Collaborative Code Review API is running!"});
});

export default app;