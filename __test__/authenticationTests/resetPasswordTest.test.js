// Jest test code
//test('', () => {});

const request = require('supertest');
const mongoose = require('mongoose');
const crypto = require('crypto');
const dotenv = require('dotenv');

const app = require('../../app');
const User = require('../../models/userModel');
const PasswordReset = require('../../models/passwordResetModel');

dotenv.config({ path: './config.env' });
describe('resetPassword', () => {
  let user;
  let passwordResetDoc;
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetToken2 = crypto.randomBytes(32).toString('hex');

  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // await User.deleteMany();
    // await PasswordReset.deleteMany();
    await mongoose.connection.db.dropDatabase();

    user = await User.create({
      name: {
        firstName: 'yasmina',
        lastName: 'hashem',
      },
      email: 'user70@gmail.com',
      password: '12345678',
    });

    passwordResetDoc = await PasswordReset.create({
      userID: user._id,
      passwordResetToken: crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex'),
      passwordResetTokenExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes
    });
  });

  afterAll(async () => {
    await User.deleteMany();
    await PasswordReset.deleteMany();
    await mongoose.connection.close();
  });

  test('Check  reset password if token is valid', async () => {
    const newPassword = 'newpassword123';

    const response = await request(app)
      .patch(`/api/v1/resetpassword/`)
      .send({
        resetToken: resetToken,
        password: newPassword,
        confirmPassword: newPassword,
      })
      .expect(200);

    expect(response.body.status).toBe('success');
    //expect(response.body.data).toHaveProperty('token');

    const updatedUser = await User.findById(user._id).select('+password');

    expect(updatedUser.password).not.toBe(user.password);
  });
  ///////////////////////////////////////////////////
  test('Check  reset password and confirm password are the same', async () => {
    const newPassword = 'newpassword123';
    passwordResetDoc.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken2)
      .digest('hex');
    passwordResetDoc.passwordResetTokenExpiry = Date.now() + 10 * 60 * 1000;
    await passwordResetDoc.save();
    await request(app)
      .patch(`/api/v1/resetpassword/`)
      .send({
        resetToken: resetToken2,
        password: newPassword,
        confirmPassword: '14575887',
      })
      .expect(400);
  });
  test('Check that token is invalid', async () => {
    // send a PATCH request to reset the password using an invalid password reset token
    await request(app)
      .patch('/api/v1/resetpassword/')
      .send({
        resetToken: resetToken,
        password: 'newpassword123',
        confirmPassword: 'newpassword123',
      })
      .expect(400);
  });
});
