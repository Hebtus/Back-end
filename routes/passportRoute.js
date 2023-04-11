/** Express router providing user related routes
 * @module Routers/authenticationRouter
 * @requires express
 */
const dotenv = require('dotenv');
const express = require('express');
const passport = require('passport');
const goolgePassportAuth = require('../passport/googlepassportAuth');
const facebookPassportAuth = require('../passport/facebookpassportAuth');

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
    // Successful authentication, redirect home.
    //res.redirect('/api/v1/events');
    res.status(200).json({
      status: 'success',
      message: 'Gamed Gedan handa5alak ma3ana Hebtus!',
    });
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
    console.log('req', req);
    // res.redirect('/api/v1/events');
    res.status(200).json({
      status: 'success',
      message: 'Gamed Gedan handa5alak ma3ana Hebtus!',
    });
  }
);

module.exports = router;
