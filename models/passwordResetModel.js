const mongoose = require('mongoose');
const crypto = require('crypto');

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
/**
 * Generates a random password reset token and saves it to the database for the user.
 *
 * @function
 * @async
 * @memberof UserSchema.methods
 * @returns {Promise<string>} The generated password reset token.
 * @throws {Error} If there is an error saving the password reset token to the database.
 */
passwordResetSchema.statics.createResetPasswordToken = async function (userID) {
  // Generate a random token
  const passwordResetToken = crypto.randomBytes(32).toString('hex');
  const passwordReset = await this.findOne({ userID: userID }); // Check if a password reset record already exists for this user
  if (!passwordReset) {
    // If no password reset record exists, create one
    await this.create({
      userID: userID,
      passwordResetToken: crypto
        .createHash('sha256')
        .update(passwordResetToken)
        .digest('hex'),
      passwordResetTokenExpiry: Date.now() + 10 * 60 * 1000, //10 mins
    });
  } else {
    // If a password reset record exists, update the existing record
    passwordReset.passwordResetToken = crypto
      .createHash('sha256')
      .update(passwordResetToken)
      .digest('hex');
    passwordReset.passwordResetTokenExpiry = Date.now() + 10 * 60 * 1000; //10 mins
    await passwordReset.save();
  }

  return passwordResetToken;
};

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

module.exports = PasswordReset;
