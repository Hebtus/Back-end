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

router.post('/', authController.protect, tickController.createTicket); //make sure i have to be logged in to create a ticket
router.patch('/:id', authController.protect, tickController.editTicket); // Auth does not work
router.post(
  '/:id/promocodes',
  authController.protect,
  promoCodeController.createPromoCode
);
router.post(
  '/:id/promocodescsv',
  authController.protect,
  promoCodeController.createPromoCodeCSV
);

module.exports = router;
