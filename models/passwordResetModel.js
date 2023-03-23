const mongoose = require('mongoose');
const crypto = require('crypto');
// const validator = require('validator');

const passwordResetSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  passwordResetToken: String,
  passwordResetTokenExpiry: Date,
});

passwordResetSchema.pre('save', async function (next) {
  await this.constructor.deleteMany({
    passwordResetTokenExpiry: { $lt: Date.now() },
  });
  next();
});

//All find querries
passwordResetSchema.pre(/^find/, async function (next) {
  this.select({
    __v: 0,
  });
  await this.model.deleteMany({
    passwordResetTokenExpiry: { $lt: Date.now() },
  });

  next();
});

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;
