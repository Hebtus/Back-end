const Ticket = require('../models/ticketModel');
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
exports.createTicket = catchAsync(async (req, res, next) => {
  if (
    (!req.body.name, // You forgot to pass the name
    !req.body.eventID ||
      !req.body.type ||
      !req.body.price ||
      !req.body.capacity ||
      !req.body.sellingStartTime ||
      !req.body.sellingEndTime)
  ) {
    res.status(401).json({
      status: 'fail',
      message: 'please provide the needed information for ticket creation',
    });
  } else {
    const newTicket = await Ticket.create({
      name: req.body.name,
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
  }
});

exports.getEventTickets = async (req, res) => {
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

exports.editTicket = async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    'capacity',
    'sellingEndTime',
    'price',
    'type'
  );
  const updatedTicket = await Ticket.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,

      context: 'query',
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedTicket,
    },
  });
};
