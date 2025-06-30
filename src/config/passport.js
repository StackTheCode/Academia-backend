const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../modules/users/models');
const { BACKEND_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = require('./env');
const logger = require('./logger');
module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        logger.info('profile:', profile);
        const newUser = {
          authType: 'google',
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
          image: profile.photos[0].value,
        };
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            done(null, user);
          } else {
            user = await User.create(newUser);
            done(null, user);
          }
        } catch (err) {
          logger.error('Error creating user: ', err);
        }
      }
    )
  );
};
