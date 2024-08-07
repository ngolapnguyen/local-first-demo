const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/userModel");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ googleId: profile.id }).then((user) => {
        if (user) {
          return done(null, user);
        } else {
          const newUser = new User({
            googleId: profile.id,
            displayName: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            profileImage: profile.photos[0].value,
          });
          newUser.save().then((user) => {
            return done(null, user);
          });
        }
      });
    }
  )
);

exports.signIn = passport.authenticate("google", {
  scope: ["email", "profile"],
});

exports.signInCallback = passport.authenticate("google", {
  failureRedirect: "/login-failure",
  successRedirect: `${process.env.CLIENT_SIDE_URI}/dashboard`,
});

exports.signInFailure = (req, res) => {
  res.send("Login failure");
};

exports.signOut = (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.log(error);
    } else {
      res.clearCookie("connect.sid", {
        path: "/",
      });

      res.status(200).json({ success: true });
    }
  });
};

exports.checkAuthStatus = (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false, user: null });
  }
};
