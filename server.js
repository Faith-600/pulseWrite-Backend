const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const passport = require("passport");
require("dotenv").config();
require("./config/passport");
// const { errorHandler } = require('./middleware/errorMiddleware');
const { errorHandler } = require("./middleware/errorMiddleware");
const app = express();


const allowedOrigins = [
    'http://localhost:3000', // Your local frontend dev server
    // Add your deployed frontend URL here when you have one
    // e.g., 'https://pulse-write-frontend.vercel.app' 
];

const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Explicitly allow PUT and other methods
    allowedHeaders: 'Content-Type, Authorization', // Explicitly allow Authorization header
    credentials: true,
};

app.options(/.*/, cors(corsOptions));

app.use(cors(corsOptions));

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
        console.log(`[LOCAL] Server started successfully on port ${PORT}`),
      );
    } catch (error) {
      console.error("Failed to start local server:", error);
      process.exit(1);
    }
  };

  startServer();
}
