const request = require('supertest');
// const session = require('express-session');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const EmailConfirm = require('../../models/emailConfirmModel');
const app = require('../../app');
const { doesNotMatch } = require('assert');
// const app = require('../../utils/config/config.env');

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

//can we really test the normal sign up confirm here ? idk
test('Check User Signup Confirm Invalid Token', async () => {
  const res = await request(app)
    .get('/api/v1/signup-confirm/2131232131')
    .expect(400);
  // done();
});

afterAll(async () => {
  await mongoose.connection.collection('users').deleteMany({});
  await User.deleteMany();
  await EmailConfirm.deleteMany();
  mongoose.disconnect();
});
