const request = require('supertest');
const mongoose = require('mongoose');
//const jest = require('jest');
const app = require('../../app');
const User = require('../../models/userModel');

// Mock the sendEmail function
jest.mock('../../utils/email', () => ({
  sendEmail: jest.fn(),
}));
const sendEmail = require('../../utils/email');

describe('Forgot Password Endpoint', () => {
  let user;

  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await User.deleteMany();
    user = await User.create({
      name: {
        firstName: 'John',
        lastName: 'Doe',
      },
      email: 'johndoe@example.com',
      password: 'password123',
    });
  });

  afterAll(async () => {
    await User.deleteMany();
    await mongoose.disconnect();
  });

  it('should return an error if user does not exist', async () => {
    const response = await request(app)
      .post('/api/v1/forgotPassword')
      .send({
        email: 'nonexistentuser@example.com',
      })
      .expect(404);

    expect(response.body).toEqual({
      status: 'fail',
      message: 'There is no user with this email address',
    });
  });

  it('should create a reset token and send an email with reset URL', async () => {
    const response = await request(app)
      .post('/api/v1/forgotPassword')
      .send({
        email: user.email,
      })
      .expect(200);

    expect(response.body).toEqual({
      status: 'success',
      message: 'Token sent to email!',
    });
    // Check that the user's reset token has been saved in the database
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.passwordResetToken).toBeTruthy();

    // Check that the sendEmail function has been called with the correct arguments
    const resetURL = `http://localhost:3000/api/v1/users//${updatedUser.passwordResetToken}`;
    expect(sendEmail).toHaveBeenCalledWith({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      message: `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:
          ${resetURL}\nIf you didn't forget your password, please ignore this email!`,
    });
  });
  it('should return an error if the email address is missing', async () => {
    const response = await request(app)
      .post('/api/v1/forgotPassword')
      .send({})
      .expect(400);

    expect(response.body).toEqual({
      status: 'fail',
      message: 'Please provide a valid email address',
    });
  });
  it('should return an error if the email address is invalid', async () => {
    const response = await request(app)
      .post('/api/v1/forgotPassword')
      .send({
        email: 'invalidemail',
      })
      .expect(400);

    expect(response.body).toEqual({
      status: 'fail',
      message: 'Please provide a valid email address',
    });
  });
});
