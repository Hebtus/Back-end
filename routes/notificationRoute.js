const express = require('express');
const authController = require('../controllers/authenticationController');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, notificationController.getNotification);
