const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
// const { createRxDatabase, addRxPlugin } = require("rxdb");
// const { getRxStorageDexie } = require("rxdb/plugins/storage-dexie");
// const RxDBServerPlugin = require("rxdb/plugins/server");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from the this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow these request methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow these request headers,
    credentials: true, // Allow credentials
  })
);

// Routes
app.use("/api/todo", require("./routes/todoRoutes"));

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
