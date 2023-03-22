const request = require('supertest');
// const session = require('express-session');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { doesNotMatch } = require('assert');
const User = require('../../models/userModel');
const app = require('../../app');
// const app = require('../../utils/config/config.env');

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
  await mongoose.connection.collection('users').deleteMany({});
  const user = await User.create({
    name: {
      firstName: 'yasmina',
      lastName: 'hashem',
    },
    email: 'user70@gmail.com',
    password: '12345678',
    accountConfirmation: 1,
  });
});

test('Check User input inCorrect password', async () => {
  const loginres = await request(app).post('/api/v1/updatepassword').send({
    passwordCurrent: 'kambotchas',
    password: 'kambotchase',
    confirmPassword: 'kambotchase',
  });
  // .expect(401);

  const res = await request(app)
    .post('/api/v1/updatepassword')
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
  const res = await request(app)
    .post('/api/v1/updatepassword')
    .send({
      passwordCurrent: '12345678',
      password: 'kambotchas',
      confirmPassword: 'kambotchases',
    })
    .expect(401);
  expect(res.body.message).toMatch('confirm password doesnt match');
  // console.log(res);
  // done();
});

test('Check password and update password correct', async () => {
  const res = await request(app)
    .post('/api/v1/updatepassword')
    .send({
      passwordCurrent: '12345678',
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
  await User.deleteMany();
  mongoose.disconnect();
});
