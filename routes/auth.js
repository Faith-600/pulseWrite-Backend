const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");
const {
  register,
  login,
  verifyEmail,
  sendOtp,
  resendVerificationCode,
} = require("../controllers/auth");

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

router.post(
  "/send-otp",
  [check("email", "Please include a valid email").isEmail()],
  sendOtp
);

router.post(
  "/resend-code",
  [check("email", "Please include a valid email").isEmail()],
  resendVerificationCode
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
  }),
  (req, res) => {
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

        const userDetails = {
          id: req.user.id,
          email: req.user.email,
          isVerified: user.isVerified,
        };

        // 2. Send back the consistent response object.
        res.json({
          token,
          user: userDetails,
        });
      }
    );
  }
);

module.exports = router;
