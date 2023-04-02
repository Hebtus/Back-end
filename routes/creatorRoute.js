const express = require('express');
// const authController = require('../controllers/authenticationController');
const creatorController = require('../controllers/creatorController');

const router = express.Router();

// router.route('/').get(creatorController.getAllEvents);

router.route('/:id').get(creatorController.getEvent);

// router.route('/events/:id/sales').get(creatorController.getSales);

module.exports = router;
