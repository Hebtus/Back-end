const request = require('supertest');
// const session = require('express-session');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const app = require('../../app');
const { doesNotMatch } = require('assert');
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
  // await mongoose.connection.collection('users').deleteMany({});
  await mongoose.connection.db.dropDatabase();
  const user = await User.create({
    name: {
      firstName: 'yasmina',
      lastName: 'hashem',
    },
    email: 'user70@gmail.com',
    password: '12345678',
  });
});
// jest.setTimeout(60000);
test('Check User Login with no password', async () => {
  const res = await request(app)
    .post('/api/v1/login')
    .send({
      email: 'user70@gmail.com',
      password: '',
    })
    .expect(401);
  expect(res.body.message).toMatch('Please provide email and password!');
  // done();
});

test('Check User Login with no Email', async () => {
  const res = await request(app)
    .post('/api/v1/login')
    .send({
      email: '',
      password: '12345678',
    })
    .expect(401);
  expect(res.body.message).toMatch('Please provide email and password!');
  // done();
});

test('Check User Login with no Confirmation', async () => {
  const res = await request(app)
    .post('/api/v1/login')
    .send({
      email: 'user70@gmail.com',
      password: '12345678',
    })
    .expect(401);
  expect(res.body.message).toMatch(
    'User not confirmed, please confirm the user through email!'
  );

  // expect(res.statusmessage).toMatch('Incorrect email or password!');
  // console.log(res);
  // done();
});

test('Check User Login with wrong password', async () => {
  const res = await request(app)
    .post('/api/v1/login')
    .send({
      email: 'user70@gmail.com',
      password: '123457',
    })
    .expect(401);
  expect(res.body.message).toMatch('Incorrect email or password!');
  // console.log(res);
  // done();
});

afterAll(async () => {
  // await mongoose.connection.collection('users').deleteMany({});
  await User.deleteMany();
  mongoose.disconnect();
});
