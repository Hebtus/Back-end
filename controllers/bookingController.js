/* eslint-disable no-plusplus */
const QRCode = require('qrcode');
const { promisify } = require('util');
// const crypto = require('crypto');
// const Event = require('../models/eventModel');
const streamifier = require('streamifier');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const PromoCode = require('../models/promoCodeModel');
const Notification = require('../models/notificationModel');
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const sendEmail = require('../utils/emailWithImage');
const AppError = require('../utils/appError');
const cloudinary = require('../utils/cloudinary');

/**
 * The Controller responsible for handling requests regarding Bookings
 * @module Controllers/bookingController
 */

/** 
@function
@description the function create notification after creator adding new attendee 
@async
@returns none 
@name createNotification
@param {array} info array  - array of information
@throws {err} If there is any validation error
*/
const createNotification = catchAsync(async ({ ...info }) => {
  const creator = await User.findOne(info.creatorID);
  const attendee = await User.findOne({ email: info.guestEmail });

  //if there is no attendee with the entered email, then he isn't registered on the site
  if (!attendee) {
    console.log('no attendee with this email');
    return;
  }

  await Notification.create({
    attendeeID: attendee._id,
    attendeeName: attendee.name,
    creatorName: creator.name,
    eventName: info.eventName,
  });
});

/** 
@function
@description the function create mail options for mail booking with event QR code 
@async
@returns none 
@name sendBookingMail
@param {bookingEmail, dataURI} 
@throws {err} If there is any internal error
*/
const sendBookingMail = catchAsync(async (bookingEmail, dataURI) => {
  const cloudUploadStream = cloudinary.uploader.upload_stream(
    { folder: 'QRCodes' },
    async (error, result) => {
      const options = {
        email: bookingEmail,
        subject: 'Event reservation',
        html: `<!DOCTYPE html>
        <p>You Successfully booked the tickets you ordered.</p>
        <p>To access event page kindly, scan the attached QR code.</p>
        <p>Here is your QR code:</p><img src="${result.secure_url}">
        <p>Thanks.</p>
        <p>Hebtus team.</p>`,
        // message: `You Successfully booked The tickets. To access event page kindly scan the attached QR code.  \n Thanks. \n Heptus team. `,
        // image: dataURI,
      };
      await sendEmail(options);
    }
  );
  streamifier.createReadStream(dataURI).pipe(cloudUploadStream);
});

/** 
@function
@description the function creates event Qr code and send it to attendee mail 
@async
@returns none 
@name sendBookingMail
@param {req, eventID, guestEmail} 
@throws {err} If there is any  error for creating event Qr code 
*/
const sendEmailWithQRcode = catchAsync(async (req, eventID, guestEmail) => {
  let text;
  // confirmURL = `${req.protocol}://${req.get(
  //   'host'
  // )}/api/v1/signup-confirm/${confirmToken}`;
  if (process.env.NODE_ENV === 'development')
    // text = `${process.env.URL}/api/v1/events/${eventID}`;
    text = `${req.protocol}://${req.get('host')}/api/v1/events/${eventID}`;
  else text = `www.hebtus.me/events/${eventID}`;

  const options = {
    errorCorrectionLevel: 'H',
    type: 'image/jpeg',
    quality: 0.3,
    margin: 1,
  };
  try {
    const toDataURL = promisify(QRCode.toDataURL);
    const dataURI = await QRCode.toDataURL(text, options);
    // return dataURI; I tried every thing to make them sepereate functions but return always undefined
    sendBookingMail(guestEmail, dataURI);

    // const dataURI = await QRCode.toDataURL(text, options);
    // return Promise.resolve(dataURI);
  } catch (err) {
    console.error(err);
    throw new Error('Failed to generate QR code');
  }
});

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
  const event = await Event.findById(req.body.eventID);

  if (!event) return next(new AppError('No event found with that ID', 404));
  if (event.creatorID.toString() !== req.user._id.toString())
    return next(new AppError('You are not the creator of this event', 403));
  //check if event is published
  if (event.draft)
    return next(new AppError('You can not add attendee to draft event', 403));

  const attendee = new Booking(req.body); // Create a new attendee object
  attendee.userID = req.user._id; // Add creatorID
  await attendee
    .save() // Save the attendee object
    .then(() => {
      const { guestEmail } = req.body;
      const eventName = event.name;
      const creatorID = req.user._id;
      createNotification({ eventName, creatorID, guestEmail });
      return res.status(200).json({
        // Send successful response
        status: 'success',
        data: attendee,
      });
    })
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
    //return next(new AppError('Invalid promo code provided!', 404));
    return res.status(404).json({
      status: 'failed',
      message: 'Invalid promo code provided!',
    });
  }
  // construct bookings by adding attendee information to every booking
  bookings.forEach((booking) => {
    booking.name = req.body.name;
    booking.userID = req.user._id;
    booking.guestEmail = req.body.guestEmail;
    booking.gender = req.body.gender;
    booking.phoneNumber = req.body.phoneNumber;
    booking.eventID = req.body.eventID;
  });
  //Save bookings to database
  await Booking.create(bookings)
    .then(() =>
      res.status(200).json({
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
  if (res.statusCode === 200) {
    await sendEmailWithQRcode(req, req.body.eventID, req.body.guestEmail);
  }
});

/** 
@function
@description the function gets Bookings of the event of the id given in the parameters and exports them into CSV fromat 
@async
@name getBookingsCSV
@param {object} req - Express request object.
@param {object} res - Express response object.
@param {function} next - Express next middleware function.
@returns {object} - Returns the response object in CSV fromat
*/
exports.getBookingsCSV = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ eventID: req.params.id });
  // write csv headers
  let csvData = [
    'First Name',
    'Last Name',
    'Gender',
    'PhoneNumber',
    'GuestEmail',
    'HomeAdress',
    'Shipping Adress',
    'Price',
    'Purchased On',
    'Quantity',
    'UserID',
    'TicketID',
  ].join(',');
  csvData += '\n';

  //loop on each event
  // eslint-disable-next-line no-restricted-syntax
  for (const booking of bookings) {
    const newData = [
      booking.name.firstName,
      booking.name.lastName,
      booking.gender,
      booking.phoneNumber,
      booking.guestEmail,
      booking.homeAdress,
      booking.shippingAdress,
      booking.price,
      booking.purchasedOn,
      booking.quantity,
      booking.userID,
      booking.ticketID,
    ].join(',');
    csvData += newData;
    csvData += '\n';
  }

  return res
    .set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="YourBookings.csv"`,
    })
    .status(200)
    .send(csvData);
});

exports.getEventBookings = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;
  const eventId = req.params.id;

  const bookings = await Booking.find({ eventID: eventId })
    .skip(skip)
    .limit(limit);
  if (!bookings) {
    return res.status(404).json({ status: 'fail', message: 'invalid eventID' });
  }

  res.status(200).json({
    status: 'success',
    data: {
      bookings,
    },
  });
});
