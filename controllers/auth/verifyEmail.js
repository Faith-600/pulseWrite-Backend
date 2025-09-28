const User = require("../../models/user");
const bcrypt = require("bcryptjs");

exports.verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "user not Found" });
    if (user.isVerified)
      return res.status(400).json({ msg: " The account is already verified" });

    if (Date.now() > user.verificationCodeExpires)
      return res.status(400).json({ msg: "Verification code has expired." });
    if (user.verificationCode !== code)
      return res.status(400).json({ msg: "Invalid verification code." });

    user.isVerified = true;
    user.verificationCodeExpires = undefined;
    user.verificationCode = undefined;
    await user.save();

    res
      .status(200)
      .json({ msg: "Email verified successfully. You can now log in." });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};
