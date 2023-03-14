// const crypto = require('crypto');
const mongoose = require('mongoose');
// const validator = require('validator');
// const bcrypt = require('bcryptjs');

function arraySize(val) {
  return val.length === 2;
}

// find a way to prevent user from playing with the type..
// perhaps a pre middleware?
const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'Point',
  },
  coordinates: {
    type: [Number],
    index: '2dsphere',
    default: [30.0594885, 31.2584644], //[longitude,latitude] //are there any required validations here?
    validate: [arraySize, 'Coordinates must be exactly 2'],
  },
});

//ensures that a user who can guess the use of GeoJSON doesn't change the types of either the location or its coordinates
locationSchema.pre('save', function (next) {
  this.type = 'Point';
  this.coordinates.index = '2dsphere';
  next();
});

module.exports = locationSchema;
