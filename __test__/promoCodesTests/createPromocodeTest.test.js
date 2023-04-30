const request = require('supertest');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const app = require('../../app');
const Event = require('../../models/eventModel');
const Ticket = require('../../models/ticketModel');
const Booking = require('../../models/bookingModel');
const loginConfirmedUser = require('../testutils/loginConfirmedUser');
const createConfirmedUser = require('../testutils/createConfirmedUser');
const PromoCode = require('../../models/promoCodeModel');
dotenv.config({ path: './config.env' });

const DBstring = process.env.TEST_DATABASE;

// Define variables for the test objects
let testEvent;
var testUser;
var jwtToken;
var testEventID;
beforeAll(async () => {
  // Connect to the test database
  await mongoose.connect(DBstring, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await mongoose.connection.db.dropDatabase();

  testUser = await createConfirmedUser.createTestUser();
  jwtToken = await loginConfirmedUser.loginUser();
  // Create a test event and save to the database
  testEvent = new Event({
    name: 'loleventxd',
    startDate: Date.now() - 1000 * 60 * 60 * 24 * 10,
    endDate: Date.now() + 1000 * 60 * 60 * 24 * 10, //after 10 days
    privacy: false,
    draft: false,
    category: 'Music',
    creatorID: testUser._id,
  });
  await testEvent.save();
  testEventID = testEvent._id;
});
test('check discount promocode created successfully', async () => {
  const res = await request(app)
    .post('/api/v1/promocodes')
    .set('authorization', `Bearer ${jwtToken}`)
    .send({
      eventID: testEventID,
      codeName: 'testcode',
      discount: 10,
      limits: 10,
      discountOrPercentage: 1,
    })
    .expect(200);
});

test('check percentage promocode with same code', async () => {
  const res = await request(app)
    .post('/api/v1/promocodes')
    .set('authorization', `Bearer ${jwtToken}`)
    .send({
      eventID: testEventID,
      codeName: 'testcode',
      percentage: 10,
      limits: 10,
      discountOrPercentage: 0,
    })
    .expect(500);
});

test('check percentage promocode with another code', async () => {
  const res = await request(app)
    .post('/api/v1/promocodes')
    .set('authorization', `Bearer ${jwtToken}`)
    .send({
      eventID: testEventID,
      codeName: 'anothercode',
      percentage: 10,
      limits: 10,
      discountOrPercentage: 0,
    })
    .expect(200);
});

afterAll(async () => {
  // Delete all test data and close the database connection
  await User.deleteMany();
  await Event.deleteMany();
  await PromoCode.deleteMany();
  mongoose.disconnect();
});
