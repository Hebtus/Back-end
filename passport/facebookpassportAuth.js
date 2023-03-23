const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/userModel');
const createSendToken = require('../routes/authenticationRoute');

/**
 * @description - Creates Facebook strategy and creates a new user if it is his first time to register, else he is logged in immediately
 * @param {object} passport -parameter passed from passportRoute
 */
exports.facebookAuth = function (passport) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: '/api/v1/oauth/login/facebook/callback',
        profileFields: ['email'],
      },
      /**
       *
       * @param {Object} accessToken -accessToken Object
       * @param {Object} refreshToken -refreshtoken Object
       * @param {Object} profile -profile Object
       * @param {Object} done -done object
       * @param {Object} req -req Object
       * @param {Object} res -res Object
       * @param {Object} next -The next object for express middleware
       */
      async (accessToken, refreshToken, profile, done, req, res, next) => {
        // 1)Create a new User object and add data to it
        const newUser = {
          FacebookID: profile.id,
          name: {
            firstName: 'Habiba', //profile.displayName.split(' ')[0],
            lastName: 'Hassan', //profile.displayName.split(' ')[1],
          },
          password: Math.random().toString().substr(2, 10),
          email: profile.id + '@facebook.com',
          accountConfirmation: 1,
        };
        //2) Find this user using fb ID, if he is in the db then done, else add the created User to the DB
        try {
          let user = await User.findOne({ FacebookID: profile.id });
          if (user) {
            done(null, user);
          } else {
            user = await User.create(newUser);
            done(null, user);
          }
        } catch (err) {
          console.error(err);
        }
      }
    )
  );
};
