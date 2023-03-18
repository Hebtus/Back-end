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

const EmailConfirm = mongoose.model('EmailConfirmation', emailConfirmSchema);

module.exports = EmailConfirm;
