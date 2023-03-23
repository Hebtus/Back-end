const request = require('supertest');
// const session = require('express-session');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('../../models/userModel');
const PasswordReset = require('../../models/passwordResetModel');

dotenv.config({ path: './config.env' });
//const app = require('../../app');
const { doesNotMatch } = require('assert');
const DBstring = process.env.TEST_DATABASE;
describe('createResetPasswordToken', () => {
  beforeAll(async () => {
    // await User.deleteMany();
    console.log('testDb is ', process.env.TEST_DATABASE);
    await mongoose
      .connect(DBstring, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log('TestDB is connected successfuly!');
      });
    //await mongoose.connection.collection('passwordreset').deleteMany({});
    await mongoose.connection.collection('users').deleteMany({});
  });

  afterAll(async () => {
    //await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  test('Check password reset token and save it to the database', async () => {
    // Create a new test user
    const userID = new mongoose.Types.ObjectId(); // Generate a new ObjectId for the user

    // Call the createResetPasswordToken function to create a reset token for the user
    const resetToken = await PasswordReset.createResetPasswordToken(userID);
    const resetTokenEncrypted = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    // Check that the reset token was created and returned
    expect(resetToken).toBeDefined();
    expect(typeof resetToken).toBe('string');
    expect(resetToken.length).toBeGreaterThan(0);

    // Check that the reset token was saved to the database
    const resetPassword = await PasswordReset.findOne({ userID: userID });

    expect(resetPassword).toBeDefined();
    expect(resetPassword.passwordResetToken).toBe(resetTokenEncrypted);
    // expect(resetPassword.passwordResetTokenExpiry).toBeInstanceOf(Date);
    expect(resetPassword.passwordResetTokenExpiry.getTime()).toBeGreaterThan(
      Date.now()
    );
  });

  test('Check update an existing password reset record and save it to the database', async () => {
    const userID = new mongoose.Types.ObjectId();
    // Create a new password reset token to be tested
    const resetToken1 = await PasswordReset.createResetPasswordToken(userID);
    const resetTokenEncrypted1 = crypto
      .createHash('sha256')
      .update(resetToken1)
      .digest('hex');
    // Check that the reset token was created and returned
    expect(resetToken1).toBeDefined();
    // Check that the reset token was saved to the database
    let passwordReset = await PasswordReset.findOne({ userID: userID });

    expect(passwordReset).not.toBeNull();
    expect(passwordReset.userID).toEqual(userID);
    expect(passwordReset.passwordResetToken).toEqual(resetTokenEncrypted1);
    expect(passwordReset.passwordResetTokenExpiry.getTime()).toBeGreaterThan(
      Date.now()
    );

    const resetToken2 = await PasswordReset.createResetPasswordToken(userID);

    const resetTokenEncrypted2 = crypto
      .createHash('sha256')
      .update(resetToken2)
      .digest('hex');
    // Check that the reset token was created and returned
    expect(resetToken2).toBeDefined();
    //Now Check thet existing password reset token is being updated
    passwordReset = await PasswordReset.findOne({ userID: userID });

    expect(passwordReset).not.toBeNull();
    expect(passwordReset.userID).toEqual(userID);
    expect(passwordReset.passwordResetToken).toEqual(resetTokenEncrypted2);
    expect(passwordReset.passwordResetTokenExpiry.getTime()).toBeGreaterThan(
      Date.now()
    );
  });
});
