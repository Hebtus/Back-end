const express = require('express');
// const userController = require('../controllers/userController');
const passport = require('passport');
const authController = require('../controllers/authenticationController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.get(
  '/signup-confirm/:emailConfirmationToken',
  authController.confirmEmail
);
//from here down add requests that are available after u r logged in only
//remeber to add the berarer token to the autherization in postman
router.use('/protect', authController.protect);

router.get('/logout', authController.logout);
router.get('/login/facebook', authController.facebookLogin);
router.get(
  '/login/google',
  passport.authenticate('google', { scope: ['profile'] })
);
router.get(
  '/login/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/events');
  }
);
router.patch('/deactivate', authController.deactivateAccount);
router.patch('/resetpassword/:token', authController.resetPassword);
router.patch('/updatepassword/:token', authController.updatePassword);
//from here down add whatever requests that are avialble to creators only
router.use('/restrict', authController.restrictTo('admin'));
module.exports = router;
