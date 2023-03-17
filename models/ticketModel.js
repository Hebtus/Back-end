const mongoose = require('mongoose');
//const validator = require('validator');

const ticketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a ticket name'],
  },
  type: {
    type: String,
    required: [true, 'Please specify the ticket type'],
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
  },
  sellingEndTime: {
    type: Date,
  },
  currentReservations: {
    type: Number,
  },
});

const User = mongoose.model('Ticket', ticketSchema);

module.exports = User;
