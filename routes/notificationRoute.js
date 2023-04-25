/** Express router providing user related routes
 * @module Routers/notificationRouter
 * @requires express
 */

const express = require('express');
const authController = require('../controllers/authenticationController');
const notificationController = require('../controllers/notificationController');

/**
 * Express router to mount user related functions on.
 * @type {object}
 * @const
 * @namespace notificationRouter
 */

const router = express.Router();

router
  .route('/')
  .get(authController.protect, notificationController.getNotification);

module.exports = router;
