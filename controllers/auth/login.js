const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });
    if (!user.isVerified)
      return res.status(401).json({ msg: "Please verify your email first." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    if (!user.isVerified) {
      return res.status(200).json({
        isVerified: false,
        user: {
          email: user.email,
        },
      });
    }

    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "5h" },
      (err, token) => {
        if (err) throw err;
        const userDetails = {
          id: user.id,
          email: user.email,
          isVerified: user.isVerified,
          // When you add more fields like 'name', you can add them here.
        };
        res.json({
          token,
          user: userDetails,
        });
      }
    );
  } catch (error) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
