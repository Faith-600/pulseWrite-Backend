const express = require("express");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ extended: false }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.get("/", (req, res) => res.send("PulseWrite API Running"));

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
