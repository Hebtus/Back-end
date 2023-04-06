const express = require('express');
// const authController = require('../controllers/authenticationController');
const creatorController = require('../controllers/creatorController');
const authController = require('../controllers/authenticationController');

const router = express.Router();

// router.route('/').get(creatorController.getAllEvents);

router.route('/:id').get(authController.protect, creatorController.getEvent);
router.get(
  '/:id/tickets',
  authController.protect,
  creatorController.getEventTicketByCreator
);
// router.route('/events/:id/sales').get(creatorController.getSales);

module.exports = router;
