const FacebookStrategy = require('passport-facebook').Strategy;

const User = require('../models/userModel');
const createSendToken = require('../routes/authenticationRoute');

// console.log('mypassport env is ', process.env);
//howa 2ary el process env

exports.facebookAuth = function (passport) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: '/api/v1/oauth/login/facebook/callback',
        profileFields: ['emails'],
      },
      async (accessToken, refreshToken, profile, done, req, res, next) => {
        const newUser = {
          FacebookID: profile.id,
          name: {
            firstName: profile.displayName.split(' ')[0],
            lastName: profile.displayName.split(' ')[1],
          },
          password: Math.random().toString().substr(2, 10),
          email: profile.id + '@facebook.com',
        };
        try {
          let user = await User.findOne({ FacebookID: profile.id });
          if (user) {
            done(null, user);
          } else {
            user = await User.create(newUser);
            done(null, user);
          }
          // createSendToken(user, 200, res);
          // console.log(`Session Checker: ${req.session.id}`.green);
          // console.log(req.session);
          // if (req.session.profile) {
          //   console.log(`Found User Session`.green);
          //   next();
          // } else {
          //   console.log(`No User Session Found`.red);
          //   res.redirect('/login');
          // }
          console.log('Successfully logged in!');
        } catch (err) {
          console.error(err);
        }
        //console.log(profile);
      }
    )
  );
};
