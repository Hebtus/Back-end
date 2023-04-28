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
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/login`);
  }
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
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/login`);
  }
);

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

router.post('/login/facebook', async (req, res) => {
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
});

module.exports = router;
