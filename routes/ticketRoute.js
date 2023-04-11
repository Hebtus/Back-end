/** Express router providing user related routes
 * @module Routers/authernticationRouter
 * @requires express
 */
// const dotenv = require('dotenv');
const express = require('express');
// const passport = require('passport');

// const userController = require('../controllers/userController');
// dotenv.config({ path: './config.env' });
const authController = require('../controllers/authenticationController');
const tickController = require('../controllers/ticketController');
const promoCodeController = require('../controllers/promoCodeController');
/**
 * Express router to mount user related functions on.
 * @type {object}
 * @const
 * @namespace authernticationRouter
 */
const router = express.Router();

router.use(authController.protect);

router.post('/', tickController.createTicket); //make sure i have to be logged in to create a ticket
router.patch('/:id', tickController.editTicket); // Auth does not work
router.post('/:id/promocodes', promoCodeController.createPromoCode);
router.post(
  '/:id/promocodescsv',
  promoCodeController.uploadCSV.single('csvFile'), //name of field that will be expected from client
  promoCodeController.createPromoCodeCSV
);

module.exports = router;
