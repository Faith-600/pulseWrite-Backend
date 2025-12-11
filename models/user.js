const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      // match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },

    password: {
      type: String,
      // No longer required for all users
      required: function () {
        return this.provider === "local";
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values, but unique if a value exists
    },

    provider: {
      type: String,
      required: true,
      enum: ["local", "google"],
      default: "local",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationCode: {
      type: String,
    },

    verificationCodeExpires: {
      type: Date,
    },

    resendCodeCooldownExpires: {
      type: Date,
    },

    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", UserSchema);
