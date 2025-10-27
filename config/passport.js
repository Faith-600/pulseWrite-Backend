const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // This function is called when Google successfully authenticates the user.
      // `profile` contains the user's Google information.
      try {
        // 1. Check if a user already exists with this Google ID
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // If user exists, we're done. Pass the user to the next step.
          return done(null, user);
        }

        // 2. If no user with that Google ID, create a new one
        const newUser = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          provider: "google",
          isVerified: true,
        });

        await newUser.save();
        done(null, newUser);
      } catch (err) {
        console.error(err);
        done(err, null);
      }
    }
  )
);
