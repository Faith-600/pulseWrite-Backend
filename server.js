const express = require("express");
const connectDB = require("./config/db");
const passport = require("passport");
require("dotenv").config();
require("./config/passport");

const app = express();

app.use(express.json({ extended: false }));
app.use(passport.initialize());

// API Routes

app.get("/ping", (req, res) => {
  res.status(200).send("Pong!");
});
app.use("/api/auth", require("./routes/auth"));
app.get("/", (req, res) => res.send("PulseWrite API is alive and kicking!"));

if (process.env.VERCEL) {
  connectDB();
  module.exports = app;
} else {
  const PORT = process.env.PORT || 5000;

  const startServer = async () => {
    try {
      await connectDB();
      app.listen(PORT, () =>
        console.log(`[LOCAL] Server started successfully on port ${PORT}`)
      );
    } catch (error) {
      console.error("Failed to start local server:", error);
      process.exit(1);
    }
  };

  startServer();
}
