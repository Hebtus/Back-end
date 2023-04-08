// const crypto = require('crypto');
const mongoose = require('mongoose');
// const validator = require('validator');
// const bcrypt = require('bcryptjs');

function arraySize(val) {
  return val.length === 2;
}

//the type validates the longitude and latitude numbers
//Format is [longitude, latitude]
// longitude must be between -180 and 180
// latitude must be between -90 and 90

//the format here is reverse compared to the one in google maps

const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'Point',
    enum: {
      //must be point
      values: ['Point'],
      message: '{VALUE} is not supported for location type',
    },
  },
  coordinates: {
    type: [Number],
    index: {
      type: String,
      default: '2dsphere',
      enum: {
        //must be 2dsphere
        values: ['2dsphere'],
        message: '{VALUE} is not supported for coordinates index',
      },
    },
    //30.026759916715474, 31.211617533138092
    default: [31.2107164, 30.0246686], //[longitude,latitude] // defaults to our Favorite place :)
    validate: [arraySize, 'Coordinates must be exactly 2'],
  },
});

module.exports = locationSchema;
