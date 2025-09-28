const express = require("express");
const router = express.Router();
const { check } = require("express-validator");
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

module.exports = router;
