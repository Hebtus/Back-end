// const crypto = require('crypto');
const mongoose = require('mongoose');
// const validator = require('validator');
// const bcrypt = require('bcryptjs');

function arraySize(val) {
  return val.length === 2;
}

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

module.exports = locationSchema;
