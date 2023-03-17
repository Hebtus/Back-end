const mongoose = require('mongoose');
const validator = require('validator');

const ticketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a ticket name'],
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
    required: [true, 'A ticketr must have a price'],
  },
  capacity: {
    type: Number,
    required: [true, 'please sepcify ticket capacity'],
  },
  sellingStartTime: {
    type: Date,
    default: Date.now(),
    validate: [validator.isDate, 'Must be right date format.'],
  },
  sellingEndTime: {
    type: Date,
    validate: [validator.isDate, 'Must be right date format.'],
  },
  currentReservations: {
    type: Number,
  },
});

const User = mongoose.model('Ticket', ticketSchema);

module.exports = User;
