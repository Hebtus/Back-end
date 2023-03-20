/** Express router providing user related routes
 * @module Routers/authernticationRouter
 * @requires express
 */

const express = require('express');
// const userController = require('../controllers/userController');
const passport = require('passport');
const authController = require('../controllers/authenticationController');

/**
 * Express router to mount user related functions on.
 * @type {object}
 * @const
 * @namespace authernticationRouter
 */
const router = express.Router();

/**
 * Route serving signup form.
 * @name post/signup
 * @function
 * @memberof module:routers/authernticationRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post('/signup', authController.signup);
/**
 * Route serving signup confirm.
 * @name get/signup
 * @function
 * @memberof module:routers/authernticationRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/signup-confirm/:confirmationToken', authController.confirmEmail);

/**
 * Route serving login form.
 * @name post/login
 * @function
 * @memberof module:routers/authernticationRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.get('/login/facebook', passport.authenticate('facebook'));

router.get(
  '/login/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login/facebook',
    scope: ['profile', 'email'],
  }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/api/v1/events');
  }
);
router.get(
  '/login/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);
// router.get(
//   '/login/google/callback',
//   passport.authenticate('google', { failureRedirect: '/api/v1/login' }),
//   (req, res) => {
//     res.redirect('/api/v1/events');
//   }
// );
//from here down add requests that are available after u r logged in only
//remeber to add the berarer token to the autherization in postman
router.use(authController.protect);

router.get('/logout', authController.logout);

router.patch('/deactivate', authController.deactivateAccount);
router.patch('/resetpassword/:token', authController.resetPassword);
router.patch('/updatepassword', authController.updatePassword);
//from here down add whatever requests that are avialble to creators only

module.exports = router;
