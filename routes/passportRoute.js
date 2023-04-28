/** Express router providing user related routes
 * @module Routers/passportRouter
 * @requires express
 */
const dotenv = require('dotenv');
const express = require('express');
const passport = require('passport');
const goolgePassportAuth = require('../passport/googlepassportAuth');
const facebookPassportAuth = require('../passport/facebookpassportAuth');
const { OAuth2Client } = require('google-auth-library');
//check that this works
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const User = require('../models/userModel');
const authenticationController = require('../controllers/authenticationController');
const catchAsync = require('../utils/catchAsync');

dotenv.config({ path: './config.env' });
goolgePassportAuth.googleAuth(passport);
facebookPassportAuth.facebookAuth(passport);
/**
 * Express router to mount user related functions on.
 * @type {object}
 * @const
 * @namespace PassportRouter
 */
const router = express.Router();

// router.use(
//   session({
//     secret: 'keyboard cat',
//     resave: false,
//     saveUninitialized: false,
//   })
// );

//Passport middleware
router.use(passport.initialize());
// app.use(passport.session());router.get('/login/facebook', passport.authenticate('facebook'));

router.get(
  '/login/facebook',
  passport.authenticate('facebook', { session: false })
);

router.get(
  '/login/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login/facebook',
    scope: ['profile', 'email'],
    session: false,
  }),
  catchAsync(async (req, res, next) => {
    console.log('req.user', req.user);
    res.redirect(`${process.env.FRONTEND_URL}/login`);
  })
);

router.get(
  '/login/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/login/google/callback',
  passport.authenticate('google', { failureRedirect: '/', session: false }),
  catchAsync(async (req, res, next) => {
    // console.log('req.user', req.user);
    //can get req.user here
    authenticationController.createToken(req.user, res);

    const tempjwttoken = res.token;

    res.redirect(`${process.env.FRONTEND_URL}/login`);
  })
);

//for cross
const AuthenticateGoogle = catchAsync(async (req, res, next) => {
  if (!req.body.tokenId)
    return res.status(400).send('You must provide Google tokenId');
  const token = req.body.tokenId;
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGEL_CLIENT_ID,
  });
  const { name, email } = ticket.getPayload();
  var user = await User.findOne({ email: email });
  if (!user) {
    user = new User({
      name: {
        firstName: name.split(' ')[0],
        lastName: name.split(' ')[1],
      },
      email: email,
      GoogleID: tokenId,
      password: Math.random().toString().substr(2, 10),
      accountConfirmation: 1,
    });
    await user.save();
  }
  authenticationController.createSendToken(user, 201, res);
});

router.post('/login/google', AuthenticateGoogle);

router.post(
  '/login/facebook',
  catchAsync(async (req, res, next) => {
    if (!req.body.email || !req.body.name)
      return res.status(400).send('request body undefined');
    var user = await User.findOne({ email: req.body.email });
    if (!user) {
      user = new User({
        name: req.body.name,
        email: req.body.email,
        password: Math.random().toString().substr(2, 10),
        accountConfirmation: 1,
      });
      await user.save();
    }

    authenticationController.createSendToken(user, 201, res);
  })
);

//for Web

// const decodeJWT = async (token) => {
//   const decoded = await promisify(jwt.verify)(
//     token,
//     process.env.JWT_SECRET
//   ).catch((error) => {
//     next(new AppError('Could not decode token.', 401));
//     // Handle the error.
//   });
//   // })(token, process.env.JWT_SECRET);
//   // 3) Check if user still exists
//   const currentUser = await User.findById(decoded.id);
//   if (!currentUser) {
//     return next(
//       new AppError(
//         'The user belonging to this token does no longer exist.',
//         401
//       )
//     );
//   }

//   // 4) Check if user changed password after the token was issued
//   if (currentUser.changedPasswordAfter(decoded.iat)) {
//     return next(
//       new AppError('User recently changed password! Please log in again.', 401)
//     );
//   }
//   //we'll see if we add changed pass after or just use changed at and compare hashoof kda
//   // GRANT ACCESS TO PROTECTED ROUTE
//   req.user = currentUser;
// };

// router.post(
//   '/login/googleverify/:token',
//   catchAsync(async (req, res, next) => {
//     const jwtToken = req.params.token;
//     const decoded = await promisify(jwt.verify)(
//       jwtToken,
//       process.env.JWT_SECRET
//     );
//   })
// );

// router.post('/login/facebookverify/:token', async (req, res) => {
//   if (!req.body.email || !req.body.name)
//     return res.status(400).send('request body undefined');
//   var user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     user = new User({
//       name: req.body.name,
//       email: req.body.email,
//       password: Math.random().toString().substr(2, 10),
//       accountConfirmation: 1,
//     });
//     await user.save();
//   }

//   authenticationController.createSendToken(user, 201, res);
// });

module.exports = router;
