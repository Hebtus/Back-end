const express = require('express');
const authController = require('../controllers/authenticationController');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

/** Express router providing user related routes
 * @module Routers/notificationRouter
 * @requires express
 */

router
  .route('/')
  .get(authController.protect, notificationController.getNotification);
