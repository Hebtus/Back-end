const express = require('express');
const authController = require('../controllers/authenticationController');
const eventController = require('../controllers/eventController');
const tickController = require('../controllers/ticketController');
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
router.get(
  'creators/events/{event_id}/sales',
  authController.protect,
  eventController.getEventSales
);
router.get(
  '/:id/tickets',
  authController.protect,
  tickController.getEventTickets
);

router
  .route('/:id')
  .get(eventController.getEvent)
  .post(eventController.getEventwithPassword) //TODO: Determine if we should make sure that uere is logged in or  can access the event with out logging in
  .patch(
    authController.protect,
    //restrict to creators
    eventController.editEvent
  );
//.post(eventController.getEventWithPassword);
//   .delete(
//     authController.protect,
//     //restrict to creators
//     eventController.deleteEvent
//   );
// //restrict to creators
router
  .route('/:id/sales')
  .get(authController.protect, eventController.getEventSales);

module.exports = router;
