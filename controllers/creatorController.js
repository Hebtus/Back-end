const Event = require('../models/eventModel');
const auth = require('./authenticationController');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const Ticket = require('../models/ticketModel');
const Booking = require('../models/bookingModel');

exports.getEvents = catchAsync(async (req, res, next) => {
  // req.user._id = '642f3260de49962dcfb8179c';
  // console.log(req.user._id);
  //Pagination Setup
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  if (req.query.csv === 'true') {
    //Get all events without pagination
    //for testing

    const eventsData = await Event.find({ creatorID: req.user._id }).select([
      '-creatorID',
    ]);
    // write to a csv file and send to client
    let csvData = [
      'Event',
      'Date',
      'Status',
      'Tickets Sold',
      'Tickets Available',
    ].join(',');
    csvData += '\n';
    // csvData += 'lolololeoldeoldeodleodleodl';

    // eslint-disable-next-line no-restricted-syntax
    for (const event of eventsData) {
      console.log('looping on event');
      console.log(event);
      // eslint-disable-next-line no-await-in-loop
      const ticketQuery = await Ticket.aggregate([
        { $match: { eventID: event._id } },
        {
          $group: {
            _id: null,
            ticketsAvailable: { $sum: '$capacity' },
          },
        },
      ]);
      console.log(ticketQuery);
      // console.log(ticketQuery[0]);
      // console.log(ticketQuery[0].ticketsAvailable);
      // console.log(ticketQuery === []);
      const ticketsAvilableData =
        ticketQuery.length === 0 ? '0' : ticketQuery[0].ticketsAvailable;

      const newData = [
        event.name,
        event.startDate,
        !event.draft ? 'draft' : 'live',
        event.ticketsSold,
        ticketsAvilableData,
      ].join(',');
      // console.log(newData);
      csvData += newData;
      csvData += '\n';
    }

    // console.log(csvData);

    return res
      .set({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="YourEvents.csv"`,
      })
      .status(200)
      .send(csvData);
    // .json({
    //   status: 'success',
    //   message: 'CSV file sent',
    // });
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

exports.deleteEvent = catchAsync(async (req, res, next) => {
  // console.log(req.user);
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
    //put delete logic here
    //get bookings.. and delete them
    //first get Tickets
    const eventTickets = await Ticket.find({
      eventID: req.params.id,
    });

    //take only the eventID's
    const ticketIDs = eventTickets.map((ticket) => ticket._id);

    // eslint-disable-next-line no-restricted-syntax
    for (const currTicketID of ticketIDs) {
      // eslint-disable-next-line no-await-in-loop
      await Booking.deleteMany({ ticketID: currTicketID });
    }

    // get Tickets and delete them
    await Ticket.deleteMany({ eventID: req.params.id });
    //finally delete the event
    await Event.deleteOne({ _id: req.params.id });

    res.status(200).json({
      status: 'success',
      message: 'event deleted successfully',
    });
  }
  next();
});

//now i have some inquires , is there a better way to check the association betwen this creator and the ticket ? the loop bacl from ticket to event to creator?
//also the comaprsion while i can get in return many tickets and many events how is it gonna go ?
exports.getEventTicketByCreator = catchAsync(async (req, res, next) => {
  //const userID = req.user._id;
  try {
    const ticket = await Ticket.findOne({ eventID: req.params.id });
    const event = await Event.findOne({ creatorID: req.user._id });
    //commented till we figure out the user change of login id
    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'invalid creator',
      });
    }
    if (!event._id.equals(req.params.id)) {
      return res.status(404).json({
        status: 'fail',
        message: 'this ticket event is not associated with this creator',
      });
    }
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
