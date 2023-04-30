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
const { string } = require('yargs');
dotenv.config({ path: './config.env' });

const DBstring = process.env.TEST_DATABASE;

// Define variables for the test objects
let testEvent;
var testUser;
var jwtToken;
var testEventID;
var filePath;
var promocodes;
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
test('check invalid csv file sent', async () => {
  filePath = `${__dirname}/testFiles/invalidTest.csv`;
  console.log(testEventID.toString());
  const res = await request(app)
    .post('/api/v1/promocodes/csv')
    .attach('csvFile', filePath)
    .set('authorization', `Bearer ${jwtToken}`)
    .field('eventID', testEventID.toString())
    .expect(500);
  promocodes = await PromoCode.find();
  expect(promocodes.length).toBe(0);
});

test('check valid file ', async () => {
  const filePath = `${__dirname}/testFiles/valid.csv`;

  const res = await request(app)
    .post('/api/v1/promocodes/csv')
    .attach('csvFile', filePath)
    .field('eventID', testEventID.toString())
    .set('authorization', `Bearer ${jwtToken}`)
    .expect(200);
  const promocodes = await PromoCode.find();
  expect(promocodes.length).toEqual(3);
});

afterAll(async () => {
  // Delete all test data and close the database connection
  await User.deleteMany();
  await Event.deleteMany();
  await PromoCode.deleteMany();
  mongoose.disconnect();
});
