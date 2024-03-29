const express = require('express');
const authController = require('../controllers/authenticationController');
const eventController = require('../controllers/eventController');
const tickController = require('../controllers/ticketController');
const bookingController = require('../controllers/bookingController');
const promocodesController = require('../controllers/promoCodeController');
const ticketRouter = require('./ticketRoute');
const bookingRouter = require('./bookingRoute');

const router = express.Router();

/** Express router providing user related routes
 * @module Routers/eventRouter
 * @requires express
 */

//redirects URL's in form of /events/{event_id}/tickets/
// router.use('/:eventID/tickets', ticketRouter);
// router.use('/:eventID/bookings', bookingRouter);

router.route('/').get(eventController.getEvents);
router
  .route('/:id')
  .get(eventController.getEvent)
  .post(eventController.getEventwithPassword);

//from here down are requests that are available after you are logged in only
router.use(authController.protect);
router.route('/').post(
  //restrict to creators
  eventController.uploadEventPhoto,
  eventController.createEvent
);
router.get('/:id/bookings/csv', bookingController.getBookingsCSV);
router.get('/:id/bookings', bookingController.getEventBookings);
router.get('/:id/tickets', tickController.getEventTickets);
router.get('/:id/sales', eventController.getEventSales);
router.get('/:id/promocodes', promocodesController.getEventPromocodes);
router.route('/:id').patch(
  //restrict to creators
  eventController.editEvent
);

router.route('/:id/sales').get(eventController.getEventSales);

module.exports = router;
