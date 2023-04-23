const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel');
const createSendToken = require('../routes/authenticationRoute');
const mongoose = require('mongoose');

/**
 * The Function responsible for handling requests made by Users to login using Google
 * @module passport/googlepassportAuth
 */

/**
 * @description - Creates Google strategy and creates a new user if it is his first time to register, else he is logged in immediately
 * @param {object} passport -parameter passed from passportRoute
 */

exports.googleAuth = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        //the call backURL here is the one that is output in the error message at Access blocked
        callbackURL: '/api/v1/oauth/login/google/callback',
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
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
          GoogleID: profile.id,
          name: {
            firstName: profile.displayName.split(' ')[0],
            lastName: profile.displayName.split(' ')[1],
          },
          img_url: profile.photos[0].value,
          password: Math.random().toString().substr(2, 10),
          email: profile.emails[0].value,
          accountConfirmation: 1,
        };
        try {
          let user = await User.findOne({
            $or: [{ GoogleID: profile.id }, { email: profile.emails[0].value }],
          });
          if (user) {
            user.GoogleID = profile.id;
            user.email = profile.emails[0].value;
            user.save();
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

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
};
