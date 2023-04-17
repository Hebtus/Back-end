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

const PromoCode = require('../../models/promoCodeModel');
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
  await mongoose.connection.collection('promocodes').deleteMany({});
  await mongoose.connection.db.dropDatabase();

  const promoCode = await PromoCode.create({
    codeName: 'mono',
    discountOrPercentage: 0,
    limits: 10,
    eventID: '64235403b361ed50a4419f60',
    percentage: 10,
  });

  const requestBodies = await requestBodyTest.requestBody();
  reqBody1 = requestBodies.reqBody1;
  reqBody2 = requestBodies.reqBody2;
  reqBody3 = requestBodies.reqBody3;
  console.log(reqBody3, 'LLLLLLLLLLLLLLOLLLLLLLLLLLLLLL');

  // console.log(reqBody1, reqBody2);
});
beforeEach(() => {});

test('Check bookings with valid data', async () => {
  await createConfirmedUser.createTestUser();
  const jwtToken = await loginConfirmedUser.loginUser();
  const res = await request(app)
    .post('/api/v1/bookings/')
    .set('authorization', `Bearer ${jwtToken}`)
    .send(reqBody1)
    .expect(200);
  //console.log(res.body.messages, 'lol');
  //expect(res.body.message).toMatch('Please provide email and password!');
});
test('Check that bookings date is  invalid', async () => {
  const jwtToken = await loginConfirmedUser.loginUser();
  const res = await request(app)
    .post('/api/v1/bookings/')
    .set('authorization', `Bearer ${jwtToken}`)
    .send(reqBody2)
    .expect(400);
  //expect(res.body.message).toMatch('Invalid promo code provided');
});

test('Check that promocode invalid', async () => {
  const jwtToken = await loginConfirmedUser.loginUser();
  const res = await request(app)
    .post('/api/v1/bookings/')
    .set('authorization', `Bearer ${jwtToken}`)
    .send(reqBody3)
    .expect(404);
  // expect(res.body.message).toMatch('Invalid promo code provided');
});

afterAll(async () => {
  // await mongoose.connection.collection('users').deleteMany({});
  await PromoCode.deleteMany();
  await Booking.deleteMany();
  mongoose.disconnect();
});
