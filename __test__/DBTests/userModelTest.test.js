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
  await mongoose.connection.collection('users').deleteMany({});
});
// jest.setTimeout(60000);

test('Check User Creation with no firstName', async () => {
  let error = null;

  try {
    const user = await User.create({
      name: {
        firstName: '',
        lastName: 'hashem',
      },
      email: 'user70@gmail.com',
      password: '12345678',
    });
  } catch (e) {
    error = e;
    console.log(e);
  }
  expect(error._message).toBe('User validation failed');
  expect(String(error.errors['name.firstName'])).toBe(
    'Please tell us your name!'
  );
});

test('Check User Creation with no lastName', async () => {
  let error = null;

  try {
    const user = await User.create({
      name: {
        firstName: 'yasmona',
        lastName: '',
      },
      email: 'user70@gmail.com',
      password: '12345678',
    });
  } catch (e) {
    error = e;
    console.log(e);
  }
  expect(error._message).toBe('User validation failed');
  expect(String(error.errors['name.lastName'])).toBe(
    'Please tell us your name!'
  );
});

test('Check User Creation with no email', async () => {
  let error = null;

  try {
    const user = await User.create({
      name: {
        firstName: 'yasmona',
        lastName: 'hashem',
      },
      email: '',
      password: '12345678',
    });
  } catch (e) {
    error = e;
    console.log(e);
  }
  expect(error._message).toBe('User validation failed');
  expect(String(error.errors['email'])).toBe('Please provide your email');
});

test('Check User Creation with invalid email', async () => {
  let error = null;

  try {
    const user = await User.create({
      name: {
        firstName: 'yasmona',
        lastName: 'hashem',
      },
      email: 'sdadsdas',
      password: '12345678',
    });
  } catch (e) {
    error = e;
    console.log(e);
  }
  expect(error._message).toBe('User validation failed');
  expect(String(error.errors['email'])).toBe('Please provide a valid email');
});

afterAll(async () => {
  // await mongoose.connection.collection('users').deleteMany({});
  await User.deleteMany();
  mongoose.disconnect();
});
