const Ticket = require('../models/ticketModel');
const catchAsync = require('../utils/catchAsync');

/**
 * The Controller responsible for dealing with tickets
 * @module Controllers/ticketController
 */

exports.createTicket = catchAsync(async (req, res, next) => {
  const newTicket = await Ticket.create({
    eventID: req.body.eventID,
    type: req.body.type,
    price: req.body.price,
    capacity: req.body.capacity,
    sellingStartTime: req.body.sellingStartTime,
    sellingEndTime: req.body.sellingEndTime,
  });
  res.status(200).json({
    status: 'success',
    message: 'ticket created successfully',
  });
  await newTicket.save();
  return newTicket;
});

exports.getEventTicket = async (req, res) => {
  const { eventId } = req.params.eventID;
  try {
    const event = await Ticket.findAll({ eventID: eventId });
    if (!event) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'invalid eventID' });
    }
    res.status(200).json({
      status: 'success',
      data: event,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
