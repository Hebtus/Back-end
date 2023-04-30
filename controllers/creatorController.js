/* eslint-disable no-restricted-syntax */
const Event = require('../models/eventModel');
const auth = require('./authenticationController');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const Ticket = require('../models/ticketModel');
const Booking = require('../models/bookingModel');
const { constants } = require('crypto');

/**
 * The Controller responsible for handling requests made by Creator to Manipulate Tickets and Events
 * @module Controllers/creatorController
 */

const getSoldandAvailable = async (eventsdData) => {
  const newEventData = [];
  for (const event of eventsdData) {
    //returns [ { _id: null, ticketsAvailable: 20 } ]
    const temp = JSON.stringify(event);
    const newevent = JSON.parse(temp);
    // eslint-disable-next-line no-await-in-loop
    const ticket = await Ticket.find({
      eventID: event._id,
      $and: [
        {
          sellingStartTime: { $lte: Date.now() },
          sellingEndTime: { $gt: Date.now() },
        },
      ],
      $expr: { $lt: ['$currentReservations', '$capacity'] },
    });
    // reutrns [ { _id: null, totalprice: 200 } ]
    // eslint-disable-next-line no-await-in-loop
    const bookingQuery = await Booking.aggregate([
      { $match: { eventID: event._id } },
      {
        $group: {
          _id: null,
          totalprice: { $sum: '$price' },
        },
      },
    ]);
    // newevent.ticketsAvailable =
    //   ticketQuery.length > 0 ? ticketQuery[0].ticketsAvailable : 0;
    if (ticket.length > 0) {
      newevent.ticketsAvailable = '1';
    } else {
      newevent.ticketsAvailable = '0';
    }
    if (bookingQuery.length > 0) {
      newevent.totalprice = bookingQuery[0].totalprice;
    } else {
      newevent.totalprice = 0;
    }

    newEventData.push(newevent);
  }

  return newEventData;
};

/**
 * @function
 * @description - Returns Events by Creator  in the Manage Events. The Request has implementes Pagination and can accept CSV that exports events in form of CSV.
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @param {object} next -The next object for express middleware
 * @returns {object} - Returns the response object
 */
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

    const eventsData = await Event.find({ creatorID: req.user._id })
      .select(['-creatorID'])
      .sort({ startDate: 1 });
    // write csv headers
    let csvData = [
      'Event',
      'Date',
      'Status',
      'Tickets Sold',
      'Tickets Available',
    ].join(',');
    csvData += '\n';

    //loop on each event
    // eslint-disable-next-line no-restricted-syntax
    for (const event of eventsData) {
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
      // console.log(ticketQuery);
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
  let eventsData;
  if (req.query.time === 'past') {
    eventsData = await Event.find({
      creatorID: req.user._id,
      endDate: { $lt: Date.now() },
    })
      .select(['-creatorID'])
      .skip(skip)
      .limit(limit)
      .sort({ startDate: 1 });
  } else if (req.query.time === 'future') {
    eventsData = await Event.find({
      creatorID: req.user._id,
      startDate: { $gt: Date.now() },
    })
      .select(['-creatorID'])
      .skip(skip)
      .limit(limit)
      .sort({ startDate: 1 });
  } else {
    eventsData = await Event.find({ creatorID: req.user._id })
      .select(['-creatorID'])
      .skip(skip)
      .limit(limit)
      .sort({ startDate: 1 });
  }
  let newEventData = await getSoldandAvailable(eventsData);
  return res.status(200).json({
    status: 'success',
    data: { events: newEventData },
  });
});

/**
 * @description -Returns one event by its id form the creators events
 * @param {object} req -the request object
 * @param {object} res -the response object
 * @param {object} next -the next object for express middleware
 * @returns {object} -returns the res object
 */
exports.getEvent = catchAsync(async (req, res, next) => {
  //console.log(req.user);
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

/**
 * @function
 * @description - Delete an Event and all its associated Tickets and Bookings. Accessible Only by Creator.
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @param {object} next -The next object for express middleware
 * @returns {object} - Returns the response object
 */
exports.deleteEvent = catchAsync(async (req, res, next) => {
  // console.log(req.user);
  const event = await Event.findOne({ _id: req.params.id });
  if (!event) {
    res.status(404).json({
      status: 'fail',
      message: 'No event found with this id ',
    });
  } else if (!event.creatorID.equals(req.user._id)) {
    res.status(401).json({
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
      message: 'Event deleted successfully',
    });
  }
  next();
});

/**
 * @function
 * @description -called to get the event tickets by the event creator himself not just for display so we drop the timing limits and all , by giving the event id and checking the creator authority
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @param {object} next -The next object for express middleware
 * @returns {object} - Returns the response object
 */
exports.getEventTicketsByCreator = catchAsync(async (req, res, next) => {
  //const userID = req.user._id;
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;
  const ticket = await Ticket.find({ eventID: req.params.id })
    .skip(skip)
    .limit(limit);
  const event = await Event.findOne({ _id: req.params.id });
  //commented till we figure out the user change of login id
  if (!event) {
    return res.status(404).json({
      status: 'fail',
      message: 'invalid event',
    });
  }
  if (!event.creatorID.equals(req.user._id)) {
    return res.status(404).json({
      status: 'fail',
      message: 'this ticket event is not associated with this creator',
    });
  }
  return res.status(200).json({
    status: 'success',
    data: {
      tickets: ticket,
    },
  });
});
