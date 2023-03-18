const mongoose = require('mongoose');
// const validator = require('validator');

const emailConfirmSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  confirmationToken: String,
  confirmationTokenExpiry: Date,
});

emailConfirmSchema.pre('save', function (next) {
  this.deleteMany({ confirmationTokenExpiry: { $lt: Date.now() } });
  next();
});

//All find querries
emailConfirmSchema.pre(/^find/, function (next) {
  this.select({
    __v: 0,
  });

  this.deleteMany({ confirmationTokenExpiry: { $lt: Date.now() } });
  next();
});

const EmailConfirm = mongoose.model('EmailConfirmation', emailConfirmSchema);

module.exports = EmailConfirm;
