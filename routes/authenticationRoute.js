/** Express router providing user related routes
 * @module Routers/authernticationRouter
 * @requires express
 */
// const dotenv = require('dotenv');
const express = require('express');
// const passport = require('passport');

// const userController = require('../controllers/userController');
// dotenv.config({ path: './config.env' });
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

//from here down add requests that are available after u r logged in only
//remeber to add the berarer token to the autherization in postman
// router.use(authController.protect);

//#endregion

router.get('/logout', authController.protect, authController.logout);

router.get('/resetpassword/:token', authController.resetPasswordForm);

router.patch(
  '/resetpassword/:token',
  // authController.protect,
  authController.resetPassword
);
router.patch(
  '/updatepassword',
  authController.protect,
  authController.updatePassword
);
//from here down add whatever requests that are avialble to creators only

module.exports = router;
