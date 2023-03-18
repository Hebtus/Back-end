// const crypto = require('crypto');
const mongoose = require('mongoose');
// const validator = require('validator');
// const bcrypt = require('bcryptjs');

function arraySize(val) {
  return val.length === 2;
}

//the type validates the longitude and latitude numbers
//Format is [longitude, latitude]

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
    default: [30.0594885, 31.2584644], //[longitude,latitude] // defaults to Cairo
    validate: [arraySize, 'Coordinates must be exactly 2'],
  },
});

module.exports = locationSchema;
