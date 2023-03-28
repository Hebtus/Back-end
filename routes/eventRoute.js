const express = require('express');
const authController = require('../controllers/authenticationController');
const eventController = require('../controllers/eventController');
const ticketRouter = require('./ticketRoute');
const bookingRouter = require('./bookingRoute');

const router = express.Router();

//redirects URL's in form of /events/{event_id}/tickets/
// router.use('/:eventID/tickets', ticketRouter);
// router.use('/:eventID/bookings', bookingRouter);

router.route('/').get(eventController.getEvents).post(
  //authController.protect,
  //restrict to creators
  eventController.createEvent
);

router
  .route('/:id')
  .get(eventController.getEvent)
  .post(eventController.getEventwithPassword); //TODO: Determine if we should make sure that uere is logged in or  can access the event with out logging in

//.post(eventController.getEventWithPassword);
//.patch(
//   authController.protect,
//   //restrict to creators
//   eventController.editEvent
// )
//   .delete(
//     authController.protect,
//     //restrict to creators
//     eventController.deleteEvent
//   );
// //restrict to creators
// router.route('/:id/sales').get(eventController.getEventSales);

module.exports = router;
