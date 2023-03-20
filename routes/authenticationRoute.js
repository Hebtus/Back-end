const express = require('express');
// const userController = require('../controllers/userController');
const passport = require('passport');
const authController = require('../controllers/authenticationController');

const router = express.Router();
router.post('/signup', authController.signup);
router.get('/signup-confirm/:confirmationToken', authController.confirmEmail);
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.get('/login/facebook', authController.facebookLogin);
router.get(
  '/login/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
//from here down add requests that are available after u r logged in only
//remeber to add the berarer token to the autherization in postman
router.use(authController.protect);

router.get('/logout', authController.logout);

router.patch('/deactivate', authController.deactivateAccount);
router.patch('/resetpassword/:token', authController.resetPassword);
router.patch('/updatepassword', authController.updatePassword);
//from here down add whatever requests that are avialble to creators only

module.exports = router;
