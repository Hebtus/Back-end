const mongoose = require('mongoose');
const validator = require('validator');
const Event = require('./eventModel');
const AppError = require('../utils/appError');

const ticketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a ticket name'],
    minlength: [1, 'Event Name can not be less than 1 character.'],
    maxlength: [30, 'Event Name can not be more than 30 characters long.'],
  },
  type: {
    type: String,
    required: [true, 'Please specify the ticket type'],
    enum: {
      //ticket types on the site itself are not in vip or not no
      values: ['VIP', 'Regular'],
      message: '{VALUE} is not supported',
    },
  },
  price: {
    type: Number,
    required: [true, 'A ticket must have a price'],
    min: 0,
  },
  capacity: {
    type: Number,
    required: [true, 'Please sepcify ticket capacity'],
    max: [10000000, 'Maximum Conceivable capacity reached'],
    min: [1, 'Minimum enumerable capacity should be greater than 0'],
    default: 1,
    validate: {
      validator: function (val) {
        return val >= this.currentReservations;
      },
      message: 'Capacity is below the current reservations',
    },
  },
  sellingStartTime: {
    type: Date,
    default: Date.now(),
    required: [true, 'Please provide a selling start  date'],
    validate: [
      {
        validator: validator.isDate,
        message: 'Date must be in the right date format.',
      },
      {
        validator: function (value) {
          return new Date(value) > new Date();
        },
        message: 'Date must be in the future',
      },
      {
        validator: function (value) {
          return value < this.sellingEndTime;
        },
        message: 'Start selling date must be before end selling date',
      },
    ],
  },
  sellingEndTime: {
    type: Date,
    required: [true, 'Please provide a selling end  date'],
    validate: [
      {
        validator: validator.isDate,
        message: 'Must be right date format.',
      },
      {
        validator: function (value) {
          return new Date(value) > new Date();
        },
        message: 'Date must be in the future',
      },
      {
        validator: function (value) {
          return value > this.sellingStartTime;
        },
        message: 'End selling date must be after start selling date',
      },
    ],
  },
  currentReservations: {
    type: Number,
    default: 0,
    max: [10000000, 'Maximum Conceivable capacity reached'],
    validate: {
      validator: function (val) {
        return val < this.capacity;
      },
      message: 'Current reservations exceeds the allowed capacity',
    },
  },
  eventID: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'Ticket Type must belong to an event.'],
  },
});

// //All find querries
ticketSchema.pre(/^find/, function (next) {
  this.select({
    __v: 0,
  });
  next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
