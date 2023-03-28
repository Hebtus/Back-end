const { promisify } = require('util');

const catchAsync = require('../utils/catchAsync');
const Event = require('../models/eventModel');

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
  res.status('200').json({
    status: 'success',
    message: '3azama bas m4 google',
  });
});

exports.getEvent = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama bas m4 google',
  });
});

exports.editEvent = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama bas m4 google',
  });
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
