const express = require('express');
const authController = require('../controllers/authenticationController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();
/** Express router providing user related routes
 * @module Routers/bookingRouter
 * @requires express
 */

// //allows nested routing
// //and lets the controller get access to previous parameters
// const router = express.Router({ mergeParams: true });

// router
//   .route('/')
//   .get(bookingController.getBookings)
//   .post(authController.protect, bookingController.createBookings);

// router.route('/:id').get(bookingController.getBooking);

// //add attendee
router.use(authController.protect);
/**
 * Route serving add-attendee form.
 * @name post/add-attendee
 * @function
 * @memberof module:Routers/bookingRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post('/add-attendee/', bookingController.addAttendee);
/**
 * Route serving create Bookings form.
 * @name post/
 * @function
 * @memberof module:Routers/bookingRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post('/', bookingController.createBookings);
module.exports = router;
