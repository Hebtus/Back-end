const { promisify } = require('util');
const crypto = require('crypto');
const Event = require('../models/eventModel');
const Ticket = require('../models/ticketModel');
const catchAsync = require('../utils/catchAsync');

exports.getEvents = catchAsync(async (req, res, next) => {
  //check on mongoose behaviour with non existent parameters
  // if parameters don't exist mongoose returns nothing
  // ie. no need for checks

  //Pagination Setup
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  //Geoquery setup
  let longitude;
  let latitude;
  if (req.query.location) {
    const locationValues = req.query.location.split(',');
    longitude = locationValues[0] * 1; //times 1 to convert them into numbers
    latitude = locationValues[1] * 1;
  } else {
    longitude = 31.2584644;
    latitude = 30.0594885;
  }
  //TODO: Implement Pagination and limits
  //TODO: add the GeoJSON logic to all of the queries
  let goQuery = 1;
  let eventsData = [];
  if (req.query.category && goQuery) {
    eventsData = await Event.find({
      category: req.query.category,
      privacy: 0,
      draft: 0,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: 50 * 1000, //assume 50 km radius
        },
      },
    })
      .skip(skip)
      .limit(limit);
    goQuery = false;
  }

  if (req.query.startDate && req.query.endDate && goQuery) {
    // The query works fine with both ISO format and UTC format
    // Other timezones and formats are not checked.

    eventsData = await Event.find({
      $or: [
        { startDate: { $gte: req.query.startDate, $lte: req.query.endDate } },
        { endDate: { $gte: req.query.startDate, $lte: req.query.endDate } },
      ],
      privacy: 0,
      draft: 0,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: 50 * 1000, //assume 50 km radius
        },
      },
    })
      .skip(skip)
      .limit(limit);

    goQuery = false;
  }

  if (req.query.free && goQuery) {
    //find events which have free tickets
    eventsData = await Event.find({
      privacy: false,
      draft: false,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: 50 * 1000, //assume 50 km radius
        },
      },
    })
      .skip(skip)
      .limit(limit);
    const eventIDs = eventsData.map((event) => event._id);

    //We first Make sure that these tickets are available to the user
    // ie. not sold out
    // and their selling time has not passed or is not yet to come etc etc
    let freeEventIDs = await Ticket.find({
      eventID: { $in: eventIDs },
      price: 0,
      sellingStartTime: { $lte: Date.now() },
      sellingEndTime: { $gte: Date.now() },
      $expr: { $lt: ['$currentReservations', '$capacity'] },
    }).select(['eventID', '-_id']);
    //take only the eventID's
    freeEventIDs = freeEventIDs.map((event) => event.eventID);

    eventsData = eventsData.filter((event) => {
      // eslint-disable-next-line no-restricted-syntax
      for (const freeEventID of freeEventIDs) {
        if (event._id.equals(freeEventID)) {
          // console.log('matched thingy ');
          return true;
        }
      }
      return false;
    });

    goQuery = false;
  }

  if (req.query.online && goQuery) {
    //online events are exempt from location restriction
    eventsData = await Event.find({ online: 1, privacy: 0, draft: 0 })
      .skip(skip)
      .limit(limit);
    goQuery = false;
  }

  //if no valid parameter had been specified for some reason
  if (goQuery) {
    eventsData = [];
  }

  res.status(200).json({
    status: 'success',
    data: { events: eventsData },
  });
});

// exports.resetPassword = catchAsync(async (req, res, next) => {
//   res.status('200').json({
//     status: 'success',
//     message: '3azama',
//   });
// });

exports.createEvent = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const event = await Event.create(req.body); //TODO: To be continued with Habaiba .. I just created it to test my event requests
  res.status('200').json({
    status: 'success',
    data: event,
  });
});

exports.getEvent = catchAsync(async (req, res, next) => {
  //if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
  // Yes, it's a valid ObjectId, proceed with `findById` call.

  const event = await Event.findOne({ _id: req.params.id }).select({
    //Note : I did not put them in the pre find middleware because not all
    // find requests will deselect the same fields ex: get event by crearot will retrieve all fields
    creatorID: 0,
    ticketsSold: 0,
    password: 0,
    draft: 0,
    goPublicDate: 0,
  });
  if (!event) {
    return res.status(404).json({
      status: 'fail',
      message: 'No such event found with id ',
    });
  }
  if (!event.privacy) {
    const eventObj = event.toObject(); // To delete privacy field
    delete eventObj.privacy;
    res.status(200).json({
      status: 'success',
      data: eventObj,
    });
  } else
    res.status(401).json({
      status: 'Unauthorized',
      message: 'You must enter the event password',
    });
  next();
});

exports.getEventwithPassword = catchAsync(async (req, res, next) => {
  const password = await crypto
    .createHash('sha256')
    .update(req.body.password)
    .digest('hex');
  //console.log(password);
  const event = await Event.findOne({ password }).select({
    //Note : I did not put them in the pre find middleware because not all
    // find requests will deselect the same fields ex: get event by crearot will retrieve all fields
    creatorID: 0,
    ticketsSold: 0,
    privacy: 0,
    draft: 0,
    password: 0,
    goPublicDate: 0,
  });
  if (!event) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid password',
    });
  }
  res.status(200).json({
    status: 'success',
    data: event,
  });
});
exports.editEvent = catchAsync(async (req, res, next) => {
  const updatedEvent = {};
  updatedEvent.description = req.body.description;
  updatedEvent.category = req.body.category;
  updatedEvent.tags = req.body.tags;
  updatedEvent.privacy = req.body.privacy;
  updatedEvent.goPublicDate = req.body.goPublicDate;
  const event = await Event.findByIdAndUpdate(req.params.id, updatedEvent);
  if (!event) {
    res.status(404).json({
      status: 'fail',
      message: 'No event found with this id ',
    });
  } else if (!event.creatorID.equals(req.user._id)) {
    res.status(404).json({
      status: 'fail',
      message: 'You cannot edit events that are not yours ',
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
  res.status('200').json({
    status: 'success',
    message: '3azama bas m4 google',
  });
});
exports.getEventSales = catchAsync(async (req, res, next) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 20;
    const skip = (page - 1) * limit;

    const event = await Event.findOne({
      _id: req.params.id,
      creatorID: req.user._id,
    });

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Invalid event or creator',
      });
    }

    const tickets = await Ticket.find({ eventID: req.params.id })
      .skip(skip)
      .limit(limit);

    if (!tickets.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'No tickets found for this event',
      });
    }

    let total = 0;
    const salesByType = [];

    tickets.forEach((ticket) => {
      const subtotal = ticket.currentReservations * ticket.price;
      total += subtotal;

      salesByType.push({
        ticketID: ticket._id,
        ticketName: ticket.name,
        ticketType: ticket.type,
        price: ticket.price,
        sold: ticket.currentReservations,
        capacity: ticket.capacity,
        subtotal,
      });
    });

    const totalNetSales = total - total * 0.225;

    res.status(200).json({
      status: 'success',
      data: {
        totalGrossSales: total,
        totalNetSales,
        salesByType,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
});
