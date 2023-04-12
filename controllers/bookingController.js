const { promisify } = require('util');
// const crypto = require('crypto');
// const Event = require('../models/eventModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
/**
 * The Controller responsible for handling requests regarding Bookings
 * @module Controllers/bookingController
 */

exports.addAttendee = catchAsync(async (req, res, next) => {
  const attendee = new Booking(req.body);
  await attendee
    .save()
    .then(() => {
      res.status('200').json({
        status: 'success',
        data: attendee,
      });
    })
    .catch((err) => {
      res.status(404).json({
        status: 'failed',
        message: err.message,
      });
    });
});
