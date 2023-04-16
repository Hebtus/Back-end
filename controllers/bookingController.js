/* eslint-disable no-plusplus */
const { promisify } = require('util');
// const crypto = require('crypto');
// const Event = require('../models/eventModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const PromoCode = require('../models/promoCodeModel');
const AppError = require('../utils/appError');
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

/** 
@function
@description the function apply the promo code discount/percentage to the bookings cost 
@async
@returns {int , array} // {total cost , updated bookings}
@name acreateBookings
@param {string} promocodeName - Promocode name.
@param {object} bookings - array of bookings
@throws {AppError} If promocode does exist or invalid
*/

const applyPromocode = async (promocodeName, bookings) => {
  // Calculate  the total prices of bookings before applying promocode
  let totalPrice = bookings.reduce((sum, booking) => sum + booking.price, 0);
  if (promocodeName) {
    const promoCode = await PromoCode.findOne({ codeName: promocodeName });
    // Search for the promocode by code name
    if (!promoCode) return 0; // If promocode does not exist in the database returns 0

    // check if the promo code is percentage
    if (promoCode.percentage) {
      //applying the percentage discount for each bookings price
      bookings.forEach((booking) => {
        booking.price -= booking.price * (promoCode.percentage / 100); // Update the price
      });
      totalPrice -= totalPrice * (promoCode.percentage / 100); // Update the total price
    } else {
      // If the promo code is amount discount

      const newPrice = totalPrice - promoCode.discountAmount; // Update the total price with the discount
      bookings.forEach((booking) => {
        // Update the prices for each booking price
        booking.price = (booking.price / totalPrice) * newPrice;
      });
      totalPrice = newPrice;
    }

    totalPrice = totalPrice > 0 ? totalPrice : 0; // To ensure that prices will be positive after applying the promocode

    promoCode.uses++;
    await promoCode.save(); // Update the promocode number of uses
  }
  return { totalPrice, bookings }; // Return the final total price and the updated bookings
};
exports.applyPromocode = applyPromocode;
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
    .catch((err) =>
      //Send error response if any error is encountered
      res.status(404).json({
        status: 'failed',
        message: err.message,
      })
    );
  //TODO: send email to the user with the booking details and QR code
});
/** 
@function
@description the function creates bookings and saves them to the database
@async
@name createBookings
@param {object} req - Express request object.
@param {object} res - Express response object.
@param {function} next - Express next middleware function.
@throws {AppError} If promocode does exist or invalid
*/

exports.createBookings = catchAsync(async (req, res, next) => {
  const { totalPrice, bookings } = await applyPromocode(
    req.body.promoCode,
    req.body.bookings
  ); // Calling  applyPromocode to update bookings costs with the promocode
  if (!bookings) {
    // If bookings is false that means promocode not found
    return next(new AppError('Invalid promo code provided'), 404);
  }
  // construct bookings by adding attendee information to every booking
  bookings.forEach((booking) => {
    booking.name = req.body.name;
    booking.userID = req.body.userID;
    booking.guestEmail = req.body.guestEmail;
    booking.gender = req.body.gender;
    booking.phoneNumber = req.body.phoneNumber;
    booking.eventID = req.body.eventID;
  });
  console.log(bookings);
  //console.log(bookings);
  //Save bookings to database
  await Booking.create(bookings)
    .then(() =>
      res.status('200').json({
        // Send successful response
        status: 'success',
        totalPrice,
        data: bookings,
      })
    )
    .catch((err) =>
      //Send error response if any error is encountered
      res.status(400).json({
        status: 'failed',
        message: err.message,
      })
    );
  //TODO: send email to the user with the booking details and QR code
});
