const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const GoogleUser = require('../modules/users/models');
const { PORT, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require('./env');

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `http://localhost:${PORT}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          image: profile.photos[0].value,
        };
        try {
          let user = await GoogleUser.findOne({ googleId: profile.id });
          if (user) {
            done(null, user);
          } else {
            user = await GoogleUser.create(newUser);
            done(null, user);
          }
        } catch (err) {
          console.log(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await GoogleUser.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
