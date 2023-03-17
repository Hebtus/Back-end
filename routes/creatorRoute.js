const express = require('express');
const authController = require('../controllers/authenticationController');
const creatorController = require('../controllers/creatorController');

const router = express.Router();

router.route('/events').get(creatorController.getAllEvents);

router.route('/events/:id').get(creatorController.getEvent);

router.route('/events/:id/sales').get(creatorController.getSales);
