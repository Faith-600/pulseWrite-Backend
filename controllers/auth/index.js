const { register } = require("./register");
const { login } = require("./login");
const { verifyEmail } = require("./verifyEmail");
const { sendOtp } = require("./sendOtp");

module.exports = {
  register,
  login,
  verifyEmail,
  sendOtp,
};
