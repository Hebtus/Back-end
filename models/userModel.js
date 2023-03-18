const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
//const eventSchema = require('./eventModel');
const locationSchema = require('./shared/locationModel');
const nameSchema = require('./shared/nameModel');
const bcrypt = require('bcryptjs');
const EmailConfirm = require('./emailConfirmModel');
const PasswordReset = require('./passwordResetModel');
//TODO: Encrypt Passwords!

const userSchema = new mongoose.Schema({
  name: nameSchema,
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    // unique: true, // #TODO: DON'T FORGET TO UNCOMMENT THIS
    lowercase: true,
    // validate: [validator.isEmail, 'Please provide a valid email'],
  },
  location: {
    type: locationSchema,
    default: () => ({}), //calls default values of the locationSchema (without it there is no location by default)
  },
  locationName: {
    type: String,
    default: 'Faculty of Engineering, Cairo University',
  },
  img_url: {
    type: String,
    validate: [validator.isURL, 'The URL must be valid.'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Minimum length for password is 8'],
    select: false, //prevents passwords from being selected while querrying users
  },
  FacebookID: {
    type: String,
  },
  GoogleID: {
    type: String,
  },

  // is the account verified through email or not
  accountConfirmation: {
    type: Boolean,
    default: false,
  },
  // is the user activated or deactivated?
  activeStatus: {
    type: Boolean,
    default: false,
  },
  //used for JWT auth
  passwordChangedAt: {
    type: Date,
    validate: [validator.isDate, 'Must be right date format.'],
    required: [true, 'Last Changed at is required'],
    default: Date.now(),
  },
  // eventID: {
  //   //check this with Joseph
  //   type: mongoose.Schema.ObjectId,
  //   ref: 'Event',
  // },
});

//All find querries
userSchema.pre(/^find/, function (next) {
  this.select({
    __v: 0,
    'location.type': 0,
    'location._id': 0,
    'name._id': 0,
  });
  next();
});

userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  // console.log('function is still called');
  // if (!this.isModified('users.password')) {
  if (!this.isModified('password')) {
    console.log('tele3 not modified bsa7ee7');
    return next();
  }

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

//for checking passwords against each other
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createEmailConfirmToken = async function () {
  const confirmToken = await crypto.randomBytes(32).toString('hex');

  //save token in either email confirm or password tables
  await EmailConfirm.create({
    userID: this._id,
    confirmationToken: crypto
      .createHash('sha256')
      .update(confirmToken)
      .digest('hex'),
    confirmationTokenExpiry: Date.now() + 60 * 60 * 1000, //1 hour
    // confirmationTokenExpiry: Date.now() + 2 * 1000, //1 hour
  });

  return confirmToken;
};

userSchema.methods.createResetPasswordToken = async function () {
  const passwordResetToken = crypto.randomBytes(32).toString('hex');

  //save token in either email confirm or password tables
  await PasswordReset.create({
    userID: this._id,
    passwordResetToken: crypto
      .createHash('sha256')
      .update(passwordResetToken)
      .digest('hex'),
    passwordResetTokenExpiry: Date.now() + 14 * 24 * 60 * 60 * 1000, //14 days
  });

  return passwordResetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
