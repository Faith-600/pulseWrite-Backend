const User = require("../../models/user");
const { sendVerificationEmail } = require("../../services/emailService");

exports.resendVerificationCode = async (req, res) => {
  const { email } = req.body;
  const COOLDOWN_PERIOD_MS = 60 * 1000;

  try {
    // 1. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      // We send a generic message for security to not reveal if an email is registered
      return res
        .status(200)
        .json({
          msg: "If an account with this email exists, a new verification code has been sent.",
        });
    }

    // 2. Check if the user is already verified
    if (user.isVerified) {
      return res
        .status(400)
        .json({ msg: "This account has already been verified." });
    }

    // 3. Check if the user is still in the cooldown period
    if (
      user.resendCodeCooldownExpires &&
      Date.now() < user.resendCodeCooldownExpires
    ) {
      const timeLeft = Math.ceil(
        (user.resendCodeCooldownExpires - Date.now()) / 1000
      );
      return res
        .status(429)
        .json({
          msg: `Please wait ${timeLeft} seconds before requesting a new code.`,
        }); // 429 Too Many Requests
    }

    // 4. Generate a new code and update the user document
    const newVerificationCode = Math.floor(
      1000 + Math.random() * 9000
    ).toString();
    user.verificationCode = newVerificationCode;
    user.verificationCodeExpires = Date.now() + 3600000; // 1 hour expiry
    user.resendCodeCooldownExpires = Date.now() + COOLDOWN_PERIOD_MS; // Set the next cooldown

    await user.save();

    // 5. Send the new verification email
    await sendVerificationEmail(user.email, newVerificationCode);

    res
      .status(200)
      .json({ msg: "A new verification code has been sent to your email." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
