const express = require('express');
const authController = require('../controllers/authenticationController');
const ticketController = require('../controllers/ticketController');

//allows nested routing
//and lets the controller get access to previous parameters
const router = express.Router({ mergeParams: true });

router.route('/').get(ticketController.getAllTickets).post(
  authController.protect,
  //restrict to creators
  ticketController.createTicket
);

//restrict to creator

router.route('/:id').patch(ticketController.editTicket);
