const mongoose = require('mongoose');
// const validator = require('validator');

const passwordResetModel = new mongoose.Schema({
  confirmationToken: String,
  confirmationTokenExpiry: Date,
});

//All find querries
passwordResetModel.pre(/^find/, function (next) {
  this.select({
    __v: 0,
  });
  next();
});

const User = mongoose.model('User', passwordResetModel);

module.exports = User;
