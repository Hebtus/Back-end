/** @module Models/userModel */
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');
//const eventSchema = require('./eventModel');
const locationSchema = require('./shared/locationModel');
const nameSchema = require('./shared/nameModel');
// const EmailConfirm = require('./emailConfirmModel');
//TODO: Encrypt Passwords!

const userSchema = new mongoose.Schema({
  name: nameSchema,
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  location: {
    type: locationSchema,
    default: () => ({}), //calls default values of the locationSchema (without it there is no location by default)
  },
  locationName: {
    type: String,
    default: 'Faculty of Engineering, Cairo University',
    maxlength: [100, 'An event must have no more than 100 characters'],
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
  //used for JWT auth
  passwordChangedAt: {
    type: Date,
    validate: [validator.isDate, 'Must be right date format.'],
    required: [true, 'Last Changed at is required'],
    default: Date.now(),
  },
});

//All find querries
/**
 * @description - Pre middleware for find functions that removes unncessary field.
 */
userSchema.pre(/^find/, function (next) {
  this.select({
    __v: 0,
    'location.type': 0,
    'location._id': 0,
    'name._id': 0,
  });
  next();
});

/**
 * @description - Pre middleware for save function that hashes password if modified.
 */
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  // console.log('function is still called');
  // if (!this.isModified('users.password')) {
  if (!this.isModified('password')) {
    // console.log('tele3 not modified bsa7ee7');
    return next();
  }

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = Date.now();
  // Delete passwordConfirm field
  // this.passwordConfirm = undefined;
  next();
});

//for checking passwords against each other
/**
 * A function that compares a given password with the password in in the Database.
 * @function
 * @memberof module:Models/userModel
 * @inner
 * @param {string} MongooseDocumentFunction - A function that is called upon a document
 * @param {callback} middleware - Mongoose middleware.
 * @returns {boolean}  -Comparison between passwords
 */
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// /**
//  * Generates a random password reset token and saves it to the database for the user.
//  *
//  * @function
//  * @async
//  * @memberof UserSchema.methods
//  * @returns {Promise<string>} The generated password reset token.
//  * @throws {Error} If there is an error saving the password reset token to the database.
//  */
// userSchema.methods.createResetPasswordToken = async function () {
//   // Generate a random token
//   const passwordResetToken = crypto.randomBytes(32).toString('hex');

//   // Check if a password reset record already exists for this user
//   const passwordReset = await PasswordReset.findOne({ userID: this._id });

//   // If no password reset record exists, create one
//   if (!passwordReset) {
//     await PasswordReset.create({
//       userID: this._id,
//       passwordResetToken: crypto
//         .createHash('sha256')
//         .update(passwordResetToken)
//         .digest('hex'),
//       passwordResetTokenExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes
//     });
//   }
//   // If a password reset record exists, update the existing record
//   else {
//     passwordReset.passwordResetToken = crypto
//       .createHash('sha256')
//       .update(passwordResetToken)
//       .digest('hex');
//     passwordReset.passwordResetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
//     await passwordReset.save();
//   }

//   return passwordResetToken;
// };

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
