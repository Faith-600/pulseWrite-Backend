const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const { sendVerificationEmail } = require("../../services/emailService");

exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) return res.status(400).json({ msg: "User already exists" });

    user = new User({ email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + 3600000; // 1 hour

    await user.save();
    await sendVerificationEmail(user.email, verificationCode);
    res.status(201).json({
      msg: "Registration successful. Please check your email for a verification code.",
    });
  } catch (err) {
    console.error(err.message);
    if (err.message === "Email could not be sent.") {
      return res
        .status(500)
        .send("User registered, but verification email could not be sent.");
    }
  }
};
