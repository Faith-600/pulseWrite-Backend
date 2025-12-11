const { register } = require("./register");
const { login } = require("./login");
const { verifyEmail } = require("./verifyEmail");
const { sendOtp } = require("./sendOtp");
const { resendVerificationCode } = require("./resendOtp");

module.exports = {
  register,
  login,
  verifyEmail,
  sendOtp,
  resendVerificationCode,
};
