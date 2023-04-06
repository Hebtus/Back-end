const Event = require('../models/eventModel');
const auth = require('./authenticationController');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const Ticket = require('../models/ticketModel');

exports.getEvents = catchAsync(async (req, res, next) => {
  console.log(req.user._id);
  //Pagination Setup
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  if (req.query.csv === 'true') {
    return res.status(200).json({
      status: 'success',
      message: 'Still being implemented :)',
      data: { events: [] },
    });
  }

  const eventsData = await Event.find({ creatorID: req.user._id })
    .select(['-creatorID'])
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 'success',
    data: { events: eventsData },
  });
});

exports.getEvent = catchAsync(async (req, res, next) => {
  console.log(req.user);
  const event = await Event.findOne({ _id: req.params.id });
  if (!event) {
    res.status(404).json({
      status: 'fail',
      message: 'No event found with this id ',
    });
  } else if (!event.creatorID.equals(req.user._id)) {
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
  const eventId = req.params.id;
  try {
    const ticket = await Ticket.findOne({ eventID: eventId });
    const event = await Event.findOne({ creatorID: userID });

    //commented till we figure out the user change of login id
    /*if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'invalid creator',
      });
    }
    if (eventId !== event._id) {
      return res.status(404).json({
        status: 'fail',
        message: 'this ticket event is not associated with this creator',
      });
    }*/
    if (!ticket) {
      return res.status(404).json({
        status: 'fail',
        message: 'invalid eventID',
      });
    }
    res.status(200).json({
      status: 'success',
      data: {
        tickets: ticket,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});
