const mongoose = require('mongoose');
// const validator = require('validator');

const passwordResetModel = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  passwordResetToken: String,
  passwordResetTokenExpiry: Date,
});

//All find querries
passwordResetModel.pre(/^find/, function (next) {
  this.select({
    __v: 0,
  });
  next();
});

const PasswordReset = mongoose.model('PasswordReset', passwordResetModel);

module.exports = PasswordReset;
