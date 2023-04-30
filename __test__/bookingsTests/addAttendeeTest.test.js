/* eslint-disable prefer-destructuring */
const request = require('supertest');
// const session = require('express-session');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Booking = require('../../models/bookingModel');
const Ticket = require('../../models/ticketModel');
const Event = require('../../models/eventModel');
const loginConfirmedUser = require('../testutils/loginConfirmedUser');
const createConfirmedUser = require('../testutils/createConfirmedUser');
const requestBodyTest = require('../testutils/createBookingsTestUtil');

const app = require('../../app');
const { doesNotMatch } = require('assert');
// const app = require('../../utils/config/config.env');

dotenv.config({ path: './config.env' });
let reqBody1;
let reqBody2;
let reqBody3;

const DBstring = process.env.TEST_DATABASE;

beforeAll(async () => {
  // await User.deleteMany();
  console.log('testDb is ', DBstring);
  await mongoose
    .connect(DBstring, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('TestDB is connected successfuly!');
    });

  await mongoose.connection.db.dropDatabase();
  const user = await createConfirmedUser.createTestUser();
  const requestBodies = await requestBodyTest.requestBody2(user._id);
  reqBody1 = requestBodies.reqBody1;
  reqBody2 = requestBodies.reqBody2;
  reqBody3 = requestBodies.reqBody3;
});
beforeEach(() => {});

test('Check add attendee with valid data', async () => {
  const jwtToken = await loginConfirmedUser.loginUser();
  const res = await request(app)
    .post('/api/v1/bookings/add-attendee/')
    .set('authorization', `Bearer ${jwtToken}`)
    .send(reqBody1)
    .expect(200);
  //console.log(res.body.messages, 'lol');
  //expect(res.body.message).toMatch('Please provide email and password!');
});

test('Check add attendee with invalid data', async () => {
  const jwtToken = await loginConfirmedUser.loginUser();
  const res = await request(app)
    .post('/api/v1/bookings/add-attendee/')
    .set('authorization', `Bearer ${jwtToken}`)
    .send(reqBody3)
    .expect(404);
  // expect(res.body.message).toMatch('Invalid promo code provided');
});

afterAll(async () => {
  // await mongoose.connection.collection('users').deleteMany({});
  await mongoose.connection.db.dropDatabase();
  mongoose.disconnect();
});
