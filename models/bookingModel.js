/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const validator = require('validator');
const nameSchema = require('./shared/nameModel');
const Ticket = require('./ticketModel');

const bookingsSchema = new mongoose.Schema({
  // Attendee Name
  name: nameSchema,
  // Name Prefix
  prefix: {
    type: String,
    trim: true,
    enum: {
      // Prefix values that user can choose from
      values: ['Mr', 'Ms', 'Miss', 'Mrs'],
      message: '{VALUE} is not supported as a prefix',
    },
  },
  //Gender Type
  gender: {
    type: String,
    trim: true,
    required: [true, 'Gender type is required'],
    enum: {
      // Gender values that user can choose from
      values: ['Male', 'Female'],
      message: '{VALUE} is not supported as a gender ',
    },
  },
  phoneNumber: {
    //Attendee phone number
    type: Number,
    required: [true, 'Please provide your phone number'],
    validate: {
      validator: function (val) {
        // Validating the phone number to make sure  that it has exact 11 digits.
        return val.toString().length === 11;
      },
      message: (val) => `Phone number has  to be 11 digits only `,
    },
  },
  guestEmail: {
    // Attendee Email address
    type: String,
    trim: true,
    required: [true, 'Please enter your email address'],
    validate: [validator.isEmail, 'Provided Email address is not valid '],
  },

  homeAdress: String,

  shippingAdress: String,

  price: {
    // The event ticket price
    type: Number,
    required: [true, 'Ticket must have a price'],
    min: 0,
  },

  purchasedOn: {
    //Date of the Booking
    type: Date,
    default: Date.now(),
    validate: [validator.isDate, 'Must be right date format.'],
  },
  quantity: {
    type: Number,
    required: [true, 'Ticket must have a quantity'],
    default: 1,
    min: [1, 'Cannot have quantity less than 1'],
  },
  userID: {
    // Refrence ID that refers to the attendee
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    // the booking might not belong to a user regisetered in the system.
  },
  ticketID: {
    // Refrence ID that refers to the ticket type which it belongs to
    type: mongoose.Schema.ObjectId,
    ref: 'Ticket',
    required: [true, 'The booked ticket  must belong to an event'],
    unique: true,
  },

  // eventID: {
  //   // Refrence ID that refers to the event
  //   type: mongoose.Schema.ObjectId,
  //   ref: 'Event',
  //   required: [true, 'The booked ticket  must belong to an event'],
  // },
});

//automatically adds 1 to currentReservations in its respective ticket
bookingsSchema.pre('save', async function () {
  await Ticket.findByIdAndUpdate(this.ticketID, {
    $inc: { currentReservations: this.quantity ? this.quantity : 1 },
  });
});

//All find querries
bookingsSchema.pre(/^find/, function (next) {
  this.select({
    __v: 0,
    'name._id': 0,
  });
  next();
});

const Booking = mongoose.model('Booking', bookingsSchema);
module.exports = Booking;
