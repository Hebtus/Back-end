const FacebookStrategy = require('passport-facebook').Strategy;

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/userModel');
const createSendToken = require('../routes/authenticationRoute');

// console.log('mypassport env is ', process.env);
//howa 2ary el process env
console.log('lollll ');

exports.GoogleAuth = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/v1/login/google/callback',
        // callbackURL: '/lol',
        // passReqToCallback: true,
      },
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
        };
        try {
          let user = await User.findOne({ GoogleID: profile.id });
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
          // console.log('Successfully logged in!');
        } catch (err) {
          console.error(err);
        }
        // console.log(profile);
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

// exports.FacebookAuth = function (passport) {
//   passport.use(
//     new FacebookStrategy(
//       {
//         clientID: process.env.FACEBOOK_CLIENT_ID,
//         clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
//         callbackURL: 'http://localhost:3000/api/v1/login/facebook/callback',
//       },
//       async (accessToken, refreshToken, profile, done, req, res, next) => {
//         const newUser = {
//           FacebookID: profile.id,
//           name: {
//             //'Habiba',
//             firstName: profile.displayName.split(' ')[0],
//             //'Hassan',
//             lastName: profile.displayName.split(' ')[1],
//           },
//           password: Math.random().toString().substr(2, 10),
//           email: 'hab@gmail.com',
//         };
//         try {
//           let user = await User.findOne({ FacebookID: profile.id });
//           if (user) {
//             done(null, user);
//           } else {
//             user = await User.create(newUser);
//             done(null, user);
//           }
//           createSendToken(user, 200, res);
//           // console.log(`Session Checker: ${req.session.id}`.green);
//           // console.log(req.session);
//           // if (req.session.profile) {
//           //   console.log(`Found User Session`.green);
//           //   next();
//           // } else {
//           //   console.log(`No User Session Found`.red);
//           //   res.redirect('/login');
//           // }
//           console.log('Successfully logged in!');
//         } catch (err) {
//           console.error(err);
//         }
//       }
//     )
//   );
// };
