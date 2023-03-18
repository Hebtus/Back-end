// const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
//const eventSchema = require('./eventModel');
const locationSchema = require('./shared/locationModel');
const nameSchema = require('./shared/nameModel');
// const bcrypt = require('bcryptjs');

//TODO: Encrypt Passwords!

const userSchema = new mongoose.Schema({
  name: nameSchema,
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    // unique: true, // #TODO: DON'T FORGET TO UNCOMMENT THIS
    lowercase: true,
    // validate: [validator.isEmail, 'Please provide a valid email'],
  },
  location: {
    type: locationSchema,
  },
  img_url: {
    type: String,
    validate: [validator.isURL, 'The URL must be valid.'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Minimum length for password is 8'],
    select: false, //prevents passwords from being selected while querrying users
  },
  FacebookID: {
    type: String,
  },
  GoogleID: {
    type: String,
  },

  // is the account verified through email or not
  accountConfirmation: {
    type: Boolean,
    default: false,
  },
  // is the user activated or deactivated?
  activeStatus: {
    type: Boolean,
    default: false,
  },
  //used for JWT auth
  passwordChangedAt: {
    type: Date,
    validate: [validator.isDate, 'Must be right date format.'],
    required: [true, 'Last Changed at is required'],
    default: Date.now(),
  },
  // eventID: {
  //   //check this with Joseph
  //   type: mongoose.Schema.ObjectId,
  //   ref: 'Event',
  // },
});

//All find querries
userSchema.pre(/^find/, function (next) {
  this.select({
    __v: 0,
    'location.type': 0,
    'location._id': 0,
    'name._id': 0,
  });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
