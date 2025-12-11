const user = require("../../models/user");
const { sendOtpEmail } = require("../../services/emailService");
const crypto = require("crypto");

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await user.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User with this email not found." });
    }

    // Generate a 4-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes in milliseconds
    await user.save();

    // Send the email with the OTP
    await sendOtpEmail(user.email, otp);

    res
      .status(200)
      .json({ msg: "An OTP has been sent to your email address." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
