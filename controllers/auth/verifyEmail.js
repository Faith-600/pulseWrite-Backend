const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) throw err;

        // 3. Create the user details object for the response (for consistency)
        const userDetails = {
          id: user.id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
        };

        res.status(200).json({
          token,
          user: userDetails,
        });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server error" });
  }
};
