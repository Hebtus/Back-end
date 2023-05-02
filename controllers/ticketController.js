const Ticket = require('../models/ticketModel');
const Event = require('../models/eventModel');
const catchAsync = require('../utils/catchAsync');

/**
 * The Controller responsible for dealing with tickets
 * @module Controllers/ticketController
 */

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
/**
 * @function
 * @description -Called to create a new ticket object for a specific event given that event id through parameteres and ticket info through the body
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @param {object} next -The next object for express middleware
 * @returns {object} - Returns the response object
 */
exports.createTicket = catchAsync(async (req, res, next) => {
  const event = await Event.findById(req.body.eventID);

  if (!event.creatorID.equals(req.user._id))
    return res.status(401).json({
      status: 'fail',
      message: 'You cannot access events that are not yours ',
    });

  // I changed it to be suitable for error handling and to be more short -Hussein
  const newTicket = await Ticket.create({
    name: req.body.name,
    eventID: req.body.eventID,
    type: req.body.type,
    price: req.body.price,
    capacity: req.body.capacity,
    sellingStartTime: req.body.sellingStartTime,
    sellingEndTime: req.body.sellingEndTime,
  });

  await newTicket
    .save()
    .then(() => {
      res.status(200).json({
        status: 'success',
        message: 'ticket created successfully',
      });
    })
    .catch((err) => {
      res.status(404).json({
        status: 'failed',
        message: err.message,
      });
    });
});
/**
 * @function
 * @description -Called to get the event tickets given the event id in the parameters and make sure the ticket is available and on display through the date
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @returns {object} - Returns the response object
 */
exports.getEventTickets = async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;
  const eventId = req.params.id;
  const event = await Event.findById(eventId);

  if (!event.creatorID.equals(req.user._id))
    return res.status(401).json({
      status: 'fail',
      message: 'You cannot access events that are not yours ',
    });
  //check on 2 things for ticket availability: 1. time 2. capacity
  const ticket = await Ticket.find({
    eventID: eventId,
    $and: [
      {
        sellingStartTime: { $lte: Date.now() },
        sellingEndTime: { $gt: Date.now() },
      },
    ],
    $expr: { $lt: ['$currentReservations', '$capacity'] },
  })
    .skip(skip)
    .limit(limit);
  if (!ticket) {
    return res.status(404).json({ status: 'fail', message: 'invalid eventID' });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tickets: ticket,
    },
  });
};
/**
@function
@description Edit the ticket information of a specefic event.
@async
@param {object} req - Express request object.
@param {object} res - Express response object.
@param {function} next - Express next middleware function.
@throws {AppError} If there is no  ticket with this id.
@throws {AppError} If there is an validation errors.
 */
exports.editTicket = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    'capacity',
    'currentReservations',
    'sellingEndTime',
    'sellingStartTime',
    'name',
    'price',
    'type'
  );

  const updatedTicket = await Ticket.findById(req.params.id);

  if (!updatedTicket) {
    return res.status(404).json({
      status: 'failed',
      message: "Couldn't find ticket with this id",
    });
  }
  const event = await Event.findById(updatedTicket.eventID);

  if (!event.creatorID.equals(req.user._id)) {
    return res.status(401).json({
      status: 'failed',
      message: 'You are not authorized to edit this ticket',
    });
  }
  if (filteredBody.name) updatedTicket.name = filteredBody.name;
  if (filteredBody.currentReservations)
    updatedTicket.currentReservations = filteredBody.currentReservations;
  if (filteredBody.sellingEndTime)
    updatedTicket.sellingEndTime = filteredBody.sellingEndTime;
  if (filteredBody.sellingStartTime)
    updatedTicket.sellingStartTime = filteredBody.sellingStartTime;
  if (filteredBody.capacity) updatedTicket.capacity = filteredBody.capacity;
  if (filteredBody.type) updatedTicket.type = filteredBody.type;
  if (filteredBody.price) updatedTicket.price = filteredBody.price;
  await updatedTicket.save();
  res.status(200).json({
    status: 'success',
    data: {
      ticket: updatedTicket,
    },
  });
});
