const request = require('supertest');
// const session = require('express-session');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { doesNotMatch } = require('assert');
const User = require('../../models/userModel');
const app = require('../../app');
const createConfirmedUser = require('../testutils/createConfirmedUser');
const loginConfirmedUser = require('../testutils/loginConfirmedUser');

// dotenv.config({ path: './utils/config/config.env' });
dotenv.config({ path: './config.env' });

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
  // await mongoose.connection.collection('users').deleteMany({});
  await mongoose.connection.db.dropDatabase();
});
test('Check User input inCorrect password', async () => {
  await createConfirmedUser.createTestUser();
  const jwtToken = await loginConfirmedUser.loginUser();
  const res = await request(app)
    .patch('/api/v1/updatepassword')
    .set('authorization', `Bearer ${jwtToken}`)
    .send({
      passwordCurrent: 'kambotchas',
      password: 'kambotchase',
      confirmPassword: 'kambotchase',
    })
    .expect(401);
  expect(res.body.message).toMatch('Your current password is wrong.');
  // console.log(res);
  // done();
});

test('Check password confirmation mismatch', async () => {
  const jwtToken = await loginConfirmedUser.loginUser();
  const res = await request(app)
    .patch('/api/v1/updatepassword')
    .set('authorization', `Bearer ${jwtToken}`)
    .send({
      passwordCurrent: '123456789',
      password: 'kambotchas',
      confirmPassword: 'kambotchases',
    })
    .expect(401);
  expect(res.body.message).toMatch('confirm password doesnt match');
  // console.log(res);
  // done();
});

test('Check password confirmation mismatch', async () => {
  const jwtToken = await loginConfirmedUser.loginUser();
  const res = await request(app)
    .patch('/api/v1/updatepassword')
    .set('authorization', `Bearer ${jwtToken}`)
    .send({
      passwordCurrent: '123456789',
      password: 'kambotchas',
      confirmPassword: 'kambotchas',
    })
    .expect(200);
  expect(res.body.message).toMatch('password updated successfully');
  // console.log(res);
  // done();
});
afterAll(async () => {
  // await mongoose.connection.collection('users').deleteMany({});
  // await User.deleteMany();
  mongoose.disconnect();
});
