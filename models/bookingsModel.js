/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const validator = require('validator');
const nameSchema = require('./shared/nameModel');

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
      message: '{VALUE} is not supported',
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
      message: '{VALUE} is not supported',
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
  },

  purchasedOn: {
    //Date of the Booking
    type: Date,
    default: Date.now(),
    validate: [validator.isDate, 'Must be right date format.'],
  },
  deleted: {
    // Boolen attribute just in case attendee cancell his booking
    type: Boolean,
    default: false,
  },
  user: {
    // Refrence ID that refers to the attendee
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'The booked ticket  must belong to a user'],
  },
  event: {
    // Refrence ID that refers to the event
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'The booked ticket  must belong to an event'],
  },
});

//All find querries
bookingsSchema.pre(/^find/, function (next) {
  this.select({
    __v: 0,
    'name._id': 0,
  });
  next();
});

const Event = mongoose.model('Bookings', bookingsSchema);
