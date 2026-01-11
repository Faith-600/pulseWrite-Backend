const User = require("../../models/user");

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.name = req.body.fullName || user.name;
    user.username = req.body.username || user.username;
    user.dateOfBirth = req.body.dateOfBirth || user.dateOfBirth;
    user.country = req.body.country || user.country;
    user.bio = req.body.bio || user.bio;
    if (req.file) {
      user.profilePictureUrl = req.file.path; // req.file.path contains the URL from Cloudinary
    }
    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      profilePictureUrl: updatedUser.profilePictureUrl,
      dateOfBirth: updatedUser.dateOfBirth,
      country: updatedUser.country,
      bio: updatedUser.bio,
    });
  } catch (error) {
    console.error(error.message);
    if (error.code === 11000) {
      // Duplicate key error (for username)
      return res.status(400).json({ msg: "Username is already taken." });
    }
    res.status(500).send("Server Error");
  }
};
const updateInterests = async (req, res) => {
  const { interests } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.interests = interests;

    await user.save();

    res.json({
      msg: "Interests updated successfully",
      user: {
        id: user._id,
        name: user.name,
        interests: user.interests,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

const getMyProfile = async (req, res) => {
  try {
    // We get the user ID from the token via the 'protect' middleware.
    // We use .select('-password') to explicitly exclude the hashed password from the response.
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  updateProfile,
  updateInterests,
  getMyProfile,
};
