const Event = require('../models/eventModel');
const auth = require('./authenticationController');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Ticket = require('../models/ticketModel');

exports.getEvent = catchAsync(async (req, res, next) => {
  //console.log(req.user);
  const event = await Event.findOne({ _id: req.params.id });
  if (!event) {
    res.status(404).json({
      status: 'fail',
      message: 'No event found with this id ',
    });
  } else if (!event.creatorID.equals('6428d14e2548b83651dd7a12')) {
    res.status(404).json({
      status: 'fail',
      message: 'You cannot access events that are not yours ',
    });
  } else {
    res.status(200).json({
      status: 'success',
      data: event,
    });
  }
  next();
});
//now i have some inquires , is there a better way to check the association betwen this creator and the ticket ? the loop bacl from ticket to event to creator?
//also the comaprsion while i can get in return many tickets and many events how is it gonna go ?
exports.getEventTicketByCreator = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const { eventId } = req.params.eventID;
  try {
    const ticket = await Ticket.findAll({ eventID: eventId });
    const event = await Event.findAll({ creatorID: userID });
    if (eventId !== event._id) {
      return res.status(404).json({
        status: 'fail',
        message: 'this ticket event is not associated with this creator',
      });
    }
    if (!ticket) {
      return res.status(404).json({
        status: 'fail',
        message: 'invalid eventID or invalid creator',
      });
    }
    res.status(200).json({
      status: 'success',
      data: ticket,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});
