const express = require('express');
// const userController = require('../controllers/userController');
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
router.get('/facebook', authController.facebookLogin);
router.get('/google', authController.googleLogin);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updatepassword/:token', authController.updatePassword);
//from here down add whatever requests that are avialble to creators only
router.use('/restrict', authController.restrictTo('admin'));
module.exports = router;
