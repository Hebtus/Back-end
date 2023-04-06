const { promisify } = require('util');
const crypto = require('crypto');
const Event = require('../models/eventModel');
const catchAsync = require('../utils/catchAsync');

exports.getEvents = catchAsync(async (req, res, next) => {
  // if (req.params)

  //check on mongoose behaviour with non existent parameters
  // if parameters don't exist mongoose returns nothing
  // console.log(req.query.category);

  //TODO: add the GeoJSON logic to all of the queries
  let bypass = 1;
  let eventsData = [];
  if (req.query.category && bypass) {
    eventsData = await Event.find({ category: req.query.category });
    bypass = false;
  }

  if (req.query.time && bypass) {
    if (req.query.date == null) {
      return res.status(400).json({
        status: 'fail',
        message: 'There must be an associated time to query properly',
      });
    }
    const today = new Date(req.query.date);
    // endofDay.setUTCHours(23, 59, 59, 999);
    //Check for later
    const endofToday = new Date(today.setHours(23, 59, 59, 999));
    if (req.query.time === 'today') {
      eventsData = await Event.find({ startDate: { $lt: endofToday } });
    } else {
      //this weekend
      eventsData = await Event.find({ startDate: { $lt: endofToday } });
    }
    bypass = false;
  }

  if (req.query.free && bypass) {
    eventsData = await Event.find({ category: req.params });
    bypass = false;
  }

  if (req.query.online && bypass) {
    eventsData = await Event.find({ online: 1 });
    bypass = false;
  }

  // const lol = await Event.find({ category: req.params });

  // console.log(lol);

  res.status('200').json({
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
  res.status('200').json({
    status: 'success',
    message: '3azama bas m4 google',
  });
});
