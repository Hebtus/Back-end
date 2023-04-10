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
  // I changes it to be suitable for error handling and to be more short
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

exports.getEventTickets = async (req, res) => {
  const eventId = req.params.id;
  try {
    const ticket = await Ticket.find({ eventID: eventId });
    if (!ticket) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'invalid eventID' });
    }
    if (
      !(
        Date.now() >= ticket.sellingStartTime &&
        Date.now() < ticket.sellingStartTime
      )
    ) {
      return res.status(404).json({
        status: 'fail',
        message: 'ticket not available in the mean time',
      });
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

exports.editTicket = async (req, res, next) => {
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
      user: updatedTicket,
    },
  });
};
// exports.createTicket = catchAsync(async (req, res, next) => {
//   if (
//     (!req.body.name, // You forgot to pass the name
//     !req.body.eventID ||
//       !req.body.type ||
//       !req.body.price ||
//       !req.body.capacity ||
//       !req.body.sellingStartTime ||
//       !req.body.sellingEndTime)
//   ) {
//     res.status(401).json({
//       status: 'fail',
//       message: 'please provide the needed information for ticket creation',
//     });
//   } else {
//     const newTicket = await Ticket.create({
//       name: req.body.name,
//       eventID: req.body.eventID,
//       type: req.body.type,
//       price: req.body.price,
//       capacity: req.body.capacity,
//       sellingStartTime: req.body.sellingStartTime,
//       sellingEndTime: req.body.sellingEndTime,
//     });
//     res.status(200).json({
//       status: 'success',
//       message: 'ticket created successfully',
//   // I changes it to be suitable for error handling and to be more short
//   const ticket = new Ticket(req.body);

//   await ticket
//     .save()
//     .then(() => {
//       res.status(200).json({
//         status: 'success',
//         message: 'ticket created successfully',
//       });
//     })
//     .catch((err) => {
//       res.status(404).json({
//         status: 'failed',
//         message: err.message,
//       });
//     });
//     await newTicket.save();
//     return newTicket;
//   }
// });
