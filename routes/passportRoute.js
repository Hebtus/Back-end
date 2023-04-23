/** Express router providing user related routes
 * @module Routers/passportRouter
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

module.exports = router;
