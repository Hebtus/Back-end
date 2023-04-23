/** Express router providing user related routes
 * @module Routers/authenticationRouter
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
 * @namespace authenticationRouter
 */
const router = express.Router();

/**
 * Route serving signup form.
 * @name post/signup
 * @function
 * @memberof module:Routers/authenticationRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post('/signup', authController.signup);
/**
 * Route serving signup confirm.
 * @name get/signup
 * @function
 * @memberof module:Routers/authenticationRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/signup-confirm/:confirmationToken', authController.confirmEmail);

/**
 * Route serving login form.
 * @name post/login
 * @function
 * @memberof module:Routers/authenticationRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);

router.patch('/resetpassword/', authController.resetPassword);
//from here down add requests that are available after you are logged in only
//remeber to add the berarer token to the authorization in postman
router.use(authController.protect);

//#endregion

router.get('/logout', authController.logout);

router.patch('/updatepassword', authController.updatePassword);
//from here down add whatever requests that are avialble to creators only

module.exports = router;
