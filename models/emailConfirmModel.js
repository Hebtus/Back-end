const mongoose = require('mongoose');
const crypto = require('crypto');
// const bcrypt = require('bcryptjs');
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

emailConfirmSchema.pre('save', async function (next) {
  //this here refers to document
  // console.log('this model is ', this.constructor);
  await this.constructor.deleteMany({
    confirmationTokenExpiry: { $lt: Date.now() },
  });
  next();
});

//All find querries
emailConfirmSchema.pre(/^find/, async function (next) {
  this.select({
    __v: 0,
  });
  //this here refers to query
  //constructor of model
  await this.model.deleteMany({
    confirmationTokenExpiry: { $lt: Date.now() },
  });
  next();
});

emailConfirmSchema.statics.createEmailConfirmToken = async function (userID) {
  const confirmToken = await crypto.randomBytes(32).toString('hex');

  //save token in either email confirm
  await this.create({
    userID: userID,
    confirmationToken: crypto
      .createHash('sha256')
      .update(confirmToken)
      .digest('hex'),
    confirmationTokenExpiry: Date.now() + 60 * 60 * 1000, //1 hour
    // confirmationTokenExpiry: Date.now() + 2 * 1000, //2 seconds
  });

  return confirmToken;
};

const EmailConfirm = mongoose.model('EmailConfirmation', emailConfirmSchema);

module.exports = EmailConfirm;
