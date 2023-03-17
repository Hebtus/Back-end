const mongoose = require('mongoose');
// const validator = require('validator');

const emailConfirmSchema = new mongoose.Schema({
  confirmationToken: String,
  confirmationTokenExpiry: Date,
});

//All find querries
emailConfirmSchema.pre(/^find/, function (next) {
  this.select({
    __v: 0,
  });
  next();
});

const User = mongoose.model('User', emailConfirmSchema);

module.exports = User;
