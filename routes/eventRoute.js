const express = require('express');
const authController = require('../controllers/authenticationController');
const eventController = require('../controllers/eventController');
const ticketRouter = require('./ticketRoute');
const bookingRouter = require('./bookingRoute');

const router = express.Router();

//redirects URL's in form of /events/{event_id}/tickets/
router.use('/:eventID/tickets', ticketRouter);
router.use('/:eventID/bookings', bookingRouter);

router.route('/').get(eventController.getEvents).post(
  //authController.protect,
  //restrict to creators
  eventController.createEvent
);

router
  .route('/:id')
  .get(eventController.getEvent)
  .patch(
    authController.protect,
    //restrict to creators
    eventController.editEvent
  )
  .delete(
    authController.protect,
    //restrict to creators
    eventController.deleteEvent
  );

//restrict to creators
router.route('/:id/sales').get(eventController.getEventSales);
