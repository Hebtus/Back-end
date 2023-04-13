const express = require('express');
// const authController = require('../controllers/authenticationController');
const creatorController = require('../controllers/creatorController');
const authController = require('../controllers/authenticationController');

const router = express.Router();

// router.route('/').get(creatorController.getAllEvents);
router.use(authController.protect);
router.get('/', creatorController.getEvents);
router
  .route('/:id')
  .get(creatorController.getEvent)
  .delete(creatorController.deleteEvent);
router.get('/:id/tickets', creatorController.getEventTicketByCreator);
// router.route('/events/:id/sales').get(creatorController.getSales);
module.exports = router;
