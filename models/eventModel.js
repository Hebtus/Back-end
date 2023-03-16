// const crypto = require('crypto');
const mongoose = require('mongoose');
//const validator = require('validator');
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
  },
  endtDate: {
    type: Date,
    required: [true, 'An event must have an end date.'],
  },
  eventID: {
    type: String,
    required: [true, 'Event must have an ID'],
    unique: true,
  },
  img_url: {
    type: String,
    default: '',
  },
  location: {
    type: locationSchema,
  },
  locationName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true,
    required: true,
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
  },
});
module.exports = eventSchema;
