// const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const locationSchema = require('./shared/locationModel');
// const bcrypt = require('bcryptjs');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'An event must have a name.'],
    unique: true,
    trim: true,
    maxlength: [40, 'An event must have less or more than 40 characters'],
    minlength: [10, 'An event must have less or equal than 10 characters'],
  },
  startDate: {
    type: Date,
    required: [true, 'An event must have a start date.'],
    validate: [validator.isDate, 'Must be right date format.'],
  },
  endtDate: {
    type: Date,
    required: [true, 'An event must have an end date.'],
    validate: [validator.isDate, 'Must be right date format.'],
  },
  img_url: {
    type: String,
    default: '',
    validate: [validator.isURL, 'The URL must be valid.'],
  },
  location: {
    type: locationSchema,
  },
  locationName: {
    type: String,
    required: true,
    maxlength: [60, 'An event must have less or more than 40 characters'],
  },
  description: {
    type: String,
    trim: true,
    required: true,
    maxlength: 400,
  },
  tags: [String],
  category: {
    type: String,
  },
  online: {
    type: Boolean,
  },
  draft: {
    type: Boolean,
  },
  goPublicDate: {
    type: Date,
    validate: [validator.isDate, 'Must be right date format.'],
  },
  password: {
    type: String,
    minlength: 8,
  },
  privacy: {
    type: Boolean,
    required: true,
  },
  ticketsSold: {
    type: Number,
    min: [0, 'Tickets Sold can not be lower than zero.'],
  },
  creatorID: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
});
const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
