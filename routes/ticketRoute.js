/** Express router providing user related routes
 * @module Routers/ticketRouter
 * @requires express
 */
// const dotenv = require('dotenv');
const express = require('express');
// const passport = require('passport');

// const userController = require('../controllers/userController');
// dotenv.config({ path: './config.env' });
const authController = require('../controllers/authenticationController');
const tickController = require('../controllers/ticketController');
/**
 * Express router to mount user related functions on.
 * @type {object}
 * @const
 * @namespace ticketRouter
 */
const router = express.Router();

router.use(authController.protect);

router.post('/', tickController.createTicket); //make sure i have to be logged in to create a ticket
router.patch('/:id', tickController.editTicket); // Auth does not work

module.exports = router;
