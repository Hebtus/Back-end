const mongoose = require('mongoose');
const validator = require('validator');

//Notice that the isAlpha validator check automatically handles leading and trailing white spaces
//hence there is no need for a pre query middleware
const nameSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please tell us your name!'],
    minlength: [1, 'First Name can not be less than 1 character.'],
    maxlength: [30, 'First Name can not be more than 30 characters long.'],
    validate: [validator.isAlpha, 'Names can only have characters in them.'],
  },
  lastName: {
    type: String,
    required: [true, 'Please tell us your name!'],
    minlength: [1, 'First Name can not be less than 1 character.'],
    maxlength: [30, 'First Name can not be more than 30 characters long.'],
    validate: [validator.isAlpha, 'Names can only have characters in them.'],
  },
});

module.exports = nameSchema;
