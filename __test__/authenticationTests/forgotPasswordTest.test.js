const request = require('supertest');
// const session = require('express-session');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const PasswordReset = require('../../models/passwordResetModel');

const app = require('../../app');
const { doesNotMatch } = require('assert');

const sendEmail = require('../../utils/email');
// const app = require('../../utils/config/config.env');

dotenv.config({ path: './config.env' });
let user;
const DBstring = process.env.TEST_DATABASE;
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
  await mongoose.connection.collection('users').deleteMany({});
  user = await User.create({
    name: {
      firstName: 'yasmina',
      lastName: 'hashem',
    },
    email: 'user70@gmail.com',
    password: '12345678',
  });
});

test('Check  if user does not exist', async () => {
  const res = await request(app)
    .post('/api/v1/forgotpassword')
    .send({
      email: 'nonexistentuser@example.com',
    })
    .expect(404);
  expect(res.body.message).toMatch('There is no user with this email address');
});
test('Check that reset token created', async () => {
  const response = await request(app)
    .post('/api/v1/forgotpassword')
    .send({
      email: user.email,
    })
    .expect(200);

  expect(response.body).toEqual({
    status: 'success',
    message: 'Token sent to email!',
  });
});
test('should return an error if the email address is missing or incorrect', async () => {
  const res = await request(app)
    .post('/api/v1/forgotpassword')
    .send({})
    .expect(400);
  //console.log(response.body + 'lol');
  expect(res.body.message).toMatch('Please provide a valid email address');
});
afterAll(async () => {
  // await mongoose.connection.collection('users').deleteMany({});
  // await User.deleteMany();
  mongoose.disconnect();
});
