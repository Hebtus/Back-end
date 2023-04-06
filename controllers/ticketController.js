const Ticket = require('../models/ticketModel');
const catchAsync = require('../utils/catchAsync');

/**
 * The Controller responsible for dealing with tickets
 * @module Controllers/ticketController
 */

exports.createTicket = catchAsync(async (req, res, next) => {
  if (
    !req.body.eventID ||
    !req.body.type ||
    !req.body.price ||
    !req.body.capacity ||
    !req.body.sellingStartTime ||
    !req.body.sellingEndTime
  ) {
    res.status(401).json({
      status: 'fail',
      message: 'please provide the needed information for ticket creation',
    });
  } else {
    const newTicket = await Ticket.create({
      eventID: req.body.eventID,
      name: req.body.name,
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
  }
});

exports.getEventTickets = async (req, res) => {
  const  eventId  = req.params.id;
  try {
    const ticket = await Ticket.findOne({ eventID: eventId });
    if (!ticket) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'invalid eventID' });
    }
    res.status(200).json({
      status: 'success',
      data: {
        ticket,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};
