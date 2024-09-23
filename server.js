import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connect from "./src/db/connect.js";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import errorHandler from "./src/helpers/errorhandler.js";

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000", // Use environment variable or fallback to localhost
  credentials: true,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Error handler middleware
app.use(errorHandler);

// Dynamic route loading
const routeFiles = fs.readdirSync("./src/routes");

routeFiles.forEach((file) => {
  // Use dynamic import
  import(`./src/routes/${file}`)
    .then((route) => {
      app.use("/api/v1", route.default);
    })
    .catch((err) => {
      console.error("Failed to load route file", err);
    });
});

// Server initialization
const server = async () => {
  try {
    await connect();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server...", error.message);
    process.exit(1);
  }
};

server();
