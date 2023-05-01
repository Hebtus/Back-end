const express = require('express');
// const authController = require('../controllers/authenticationController');
const creatorController = require('../controllers/creatorController');
const authController = require('../controllers/authenticationController');

const router = express.Router();

/** Express router providing user related routes
 * @module Routers/creatorRouter
 * @requires express
 */

// router.route('/').get(creatorController.getAllEvents);
router.use(authController.protect);

/**
 * Route serving the creator to get Events
 * @name get/
 * @function
 * @memberof module:Routers/creatorRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/', creatorController.getEvents);

/**
 * Route serving the creator to get Event by ID
 * @name get/:id
 * @function
 * @memberof module:Routers/creatorRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
/**
 * Route serving delete Event
 * @name delete/:id
 * @function
 * @memberof module:Routers/creatorRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router
  .route('/:id')
  .get(creatorController.getEvent)
  .delete(creatorController.deleteEvent);

/**
 * Route serving the creator to get Event Tickets
 * @name get/:id/ticket
 * @function
 * @memberof module:Routers/creatorRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get('/:id/tickets', creatorController.getEventTicketsByCreator);
// router.route('/events/:id/sales').get(creatorController.getSales);
module.exports = router;
