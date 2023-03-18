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

passwordResetModel.pre('save', function (next) {
  this.deleteMany({ passwordResetTokenExpiry: { $lt: Date.now() } });
  next();
});

//All find querries
passwordResetModel.pre(/^find/, function (next) {
  this.select({
    __v: 0,
  });
  this.deleteMany({ passwordResetTokenExpiry: { $lt: Date.now() } });

  next();
});

const PasswordReset = mongoose.model('PasswordReset', passwordResetModel);

module.exports = PasswordReset;
