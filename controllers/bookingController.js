const { promisify } = require('util');
// const crypto = require('crypto');
// const Event = require('../models/eventModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
/**
 * The Controller responsible for handling requests regarding Bookings
 * @module Controllers/bookingController
 */
/** 
@function
@description the function add attendee to the event by the creator of the event
@async
@name addAttendee
@param {object} req - Express request object.
@param {object} res - Express response object.
@param {function} next - Express next middleware function.
@throws {AppError} If any of the input body does mot meet the schema validations.
*/
exports.addAttendee = catchAsync(async (req, res, next) => {
  const attendee = new Booking(req.body); // Create a new attendee object
  await attendee
    .save() // Save the attendee object
    .then(() =>
      res.status('200').json({
        // Send successful response
        status: 'success',
        data: attendee,
      })
    )
    .catch((err) => {
      //Send error response if any error is encountered
      res.status(404).json({
        status: 'failed',
        message: err.message,
      });
    });
});
exports.createBookings = catchAsync(async (req, res, next) => {
  //TODO: Handle promocodes
  const { bookings } = req.body;
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const booking of bookings) {
    booking.name = req.body.name;
    booking.userID = req.body.userID;
    booking.guestEmail = req.body.guestEmail;
    booking.gender = req.body.gender;
    booking.phoneNumber = req.body.phoneNumber;
  }
  // bookings = await bookings.map((booking) => new Booking(booking).save()); // Create a new attendee object);

  console.log(bookings);
  // const docs = await Promise.all(bookings)
  await Booking.create(bookings)
    .then(() => {
      res.status('200').json({
        // Send successful response
        status: 'success',
        data: bookings,
      });
    })
    .catch((err) => {
      //Send error response if any error is encountered
      res.status(404).json({
        status: 'failed',
        message: err.message,
      });
    });
});
