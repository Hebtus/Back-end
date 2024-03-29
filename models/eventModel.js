const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const locationSchema = require('./shared/locationModel');

const eventSchema = new mongoose.Schema({
  ////////////////////////////****Basic info****/////////////////////
  name: {
    type: String,
    required: [true, 'An event must have a name.'],
    trim: true,
    maxlength: [40, 'An event name must must be at most 40 characters'],
    minlength: [1, 'An event name must must be at least 1 character'],
  },
  startDate: {
    type: Date,
    required: [true, 'An event must have a start date.'],
    validate: [validator.isDate, 'Must be right date format.'],
  },
  endDate: {
    type: Date,
    required: [true, 'An event must have an end date.'],
    validate: [validator.isDate, 'Must be right date format.'],
  },
  img_url: {
    type: String,
    default: '',
    validate: [
      //wrapper for making it not required
      (val) => {
        if (val.length !== 0) validator.isURL(val);
        else {
          return 1;
        }
      },
      'The image URL must be valid.',
    ],
  },
  location: {
    type: locationSchema,
  },
  locationName: {
    type: String,
    required: true,
    maxlength: [100, 'A location name must have no more than 100 characters'],
    minlength: [
      1,
      'A location name must have less or equal than 10 characters',
    ],
    default: 'Faculty of Engineering, Cairo University',
  },
  category: {
    type: String,
    enum: {
      values: ['Music', 'Food & Drink', 'Charity & Causes'],
      message: '{VALUE} is not supported in event categories',
    },
    required: [true, 'An event must have a category.'],
  },
  //////////////////////end of Basic Info/////////////////////////
  description: {
    type: String,
    trim: true,
    minlength: [1, 'An event description must must be at least 1 character'],
    maxlength: [
      400,
      'An event description must must be at most 400 characters',
    ],
  },
  tags: {
    type: [String],
    default: [],
    validator: function (array) {
      return array.every(
        (v) => typeof v === 'string' && v.length > 0 && v.length < 80
      );
    },
    required: [true, 'An event must have a category.'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: 400,
  },
  tags: {
    type: [String],
    default: [],
    validator: function (array) {
      return array.every(
        (v) => typeof v === 'string' && v.length > 0 && v.length < 80
      );
    },
  },
  online: {
    type: Boolean,
  },
  draft: {
    type: Boolean,
    default: true,
    required: true,
  },
  goPublicDate: {
    type: Date,
    validate: [validator.isDate, 'Must be right date format.'],
  },
  password: {
    type: String,
    minlength: 8,
    default: null,
  },
  privacy: {
    type: Boolean,
    default: false,
    required: true,
  },
  ticketsSold: {
    type: Number,
    min: [0, 'Tickets Sold can not be lower than zero.'],
    default: 0,
  },
  creatorID: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    // required: true,
  },
});
eventSchema.index({ location: '2dsphere' });

eventSchema.pre('save', function (next) {
  if (this.isNew && !this.location) {
    this.location = {
      coordinates: [31.2107164, 30.0246686],
    };
  }

  return next();
});

eventSchema.pre(/^find/, function (next) {
  this.select({
    __v: 0,
    'location.type': 0,
    'location._id': 0,
  });
  next();
});

eventSchema.pre('save', async function (next) {
  // Hash the password with cost of 12
  if (this.password) {
    this.password = await crypto
      .createHash('sha256')
      .update(this.password)
      .digest('hex');
  }
  next();
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
