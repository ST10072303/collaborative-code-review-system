import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import "./types/express";
import userRoutes from "./routes/userRoutes";
import projectRoutes from "./routes/projectRoutes";


// app will be responsible for handling HTTP requests.
const app = express();

// allow the API to receive requests from different origins.
app.use(cors());

// allow Express to read JSON data sent in request bodies.
app.use(express.json());

// authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);

// test route.
app.get("/", (req, res) => {
  res.json({message: "Collaborative Code Review API is running!"});
});


export default app;