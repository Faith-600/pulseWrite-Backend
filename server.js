const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const passport = require("passport");
require("dotenv").config();
require("./config/passport");
// const { errorHandler } = require('./middleware/errorMiddleware');
const { errorHandler } = require("./middleware/errorMiddleware");
const app = express();

app.use(cors());

// const allowedOrigins = [
//     'http://localhost:3000', // Your local frontend
//     'https://your-live-frontend-url.vercel.app' // Your deployed frontend URL
// ];

// const corsOptions = {
//     origin: (origin, callback) => {
//         if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     }
// };

// app.use(cors(corsOptions));

app.use(express.json({ extended: false }));
app.use(passport.initialize());

// API Routes

app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/user"));
app.use("/api/posts", require("./routes/post"));

app.use(errorHandler);

app.get("/", (req, res) => {
  res.status(200).send("PulseWrite API is alive and kicking!");
});

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
