// // const crypto = require('crypto');
// const mongoose = require('mongoose');
// const validator = require('validator');
// // const bcrypt = require('bcryptjs');

// // const locationSchema = new mongoose.Schema({
// //   longitude: {
// //     type: String,
// //     required: [true, 'Please tell us your name!'],
// //     minlength: [1, 'First Name can not be less than 1 character.'],
// //     maxlength: [30, 'First Name can not be more than 30 characters long.'],
// //   },
// //   latitude: {
// //     type: String,
// //     required: [true, 'Please tell us your name!'],
// //     minlength: [1, 'First Name can not be less than 1 character.'],
// //     maxlength: [30, 'First Name can not be more than 30 characters long.'],
// //   },
// // });

// const eventSchema = new mongoose.Schema({
//   name: { String, require: [true, 'An event must have a name.'] },
//   startDate: {
//     type: Date,
//   },
//   endtDate: {
//     type: Date,
//   },
//   img_url: {
//     type: String,
//     default: '',
//   },
//   location: {
//     type: 'Point',
//     required: [
//       'Latitude is required to define location.',
//       'Longitude is required to define location.',
//     ],
//   },
//   password: {
//     type: String,
//     required: [true, 'Please provide a password'],
//     minlength: 8,
//     select: false,
//   },
//   FacebookID: {
//     type: String,
//   },
//   GoogleID: {
//     type: String,
//   },

//   // is the account verified through email or not
//   accountConfirmation: {
//     type: Boolean,
//     default: false,
//   },
//   activeStatus: {
//     type: Boolean,
//     default: false,
//   },
//   passwordChangedAt: {
//     type: Date,
//   },
// });
