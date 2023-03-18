const express = require('express');
const authController = require('../controllers/authenticationController');
const bookingController = require('../controllers/bookingController');

//allows nested routing
//and lets the controller get access to previous parameters
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(bookingController.getBookings)
  .post(authController.protect, bookingController.createBookings);

router.route('/:id').get(bookingController.getBooking);

//add attendee?
