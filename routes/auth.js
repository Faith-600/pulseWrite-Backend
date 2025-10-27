const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { register, login, verifyEmail } = require("../controllers/auth");

const registerValidation = [
  check("email", "Please include a valid email").isEmail(),
  check("password", "Password must be 6 or more characters").isLength({
    min: 6,
  }),
];

router.post("/register", registerValidation, register);

router.post(
  "/verify",
  [
    check("email").isEmail(),
    check("code", "Code must be 4 digits").isLength({ min: 4, max: 4 }),
  ],
  verifyEmail
);

router.post(
  "/login",
  [
    check("email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  login
);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login-failed",
  }), // We are using JWT, so session is false
  (req, res) => {
    // User is authenticated by Google and Passport has created/found them in our DB.
    // The user object is attached to the request as req.user.
    // Now, we create our own JWT and send it back to the client.

    const payload = {
      user: {
        id: req.user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) throw err;
        // In a real app, you would redirect to the frontend with the token,
        // but for an API test, we can just send it as JSON.
        res.json({ token });
      }
    );
  }
);

module.exports = router;
