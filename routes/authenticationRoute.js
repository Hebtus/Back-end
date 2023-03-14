const express = require('express');
// const userController = require('../controllers/userController');
const authController = require('../controllers/authenticationController');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.get(
  '/signup-confirm/:emailConfirmationToken',
  authController.confirmEmail
);

router.post('/forgotpassword', authController.forgotPassword);

router.get('/facebook', authController.facebookLogin);
router.get('/google', authController.googleLogin);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updatepassword/:token', authController.updatePassword);
module.exports = router;
