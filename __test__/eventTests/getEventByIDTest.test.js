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

dotenv.config({ path: './config.env' });

const DBstring = process.env.TEST_DATABASE;
let testEvent1;
let testEvent2;
let testEvent3;

let testEvent1ID;
let testEvent2ID;
let testEvent3ID;

beforeAll(async () => {
  // Connect to the test database
  await mongoose.connect(DBstring, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await mongoose.connection.db.dropDatabase();
  const testUser = await createConfirmedUser.createTestUser();
  testEvent1 = {
    name: 'loleventxd',
    startDate: Date.now() - 1000 * 60 * 60 * 24 * 10,
    endDate: Date.now() + 1000 * 60 * 60 * 24 * 10, //after 10 days
    privacy: false,
    draft: false,
    category: 'Music',
    creatorID: testUser._id,
  };
  testEvent2 = { ...testEvent1 };
  testEvent2.privacy = true;
  testEvent3 = { ...testEvent1, password: 123456789 };
  testEvent3.privacy = true;

  await Event.create(testEvent1).then((doc) => (testEvent1ID = doc.id));
  await Event.create(testEvent2).then((doc) => (testEvent2ID = doc.id));
  await Event.create(testEvent3).then((doc) => (testEvent3ID = doc.id));

  // Create a test event and save to the database
});

test('Check get the event with the id', async () => {
  const jwtToken = await loginConfirmedUser.loginUser();

  const res = await request(app)
    .get(`/api/v1/events/${testEvent1ID}`)
    .set('authorization', `Bearer ${jwtToken}`)
    .expect(200);
});

test('Check get the event with the id by link ', async () => {
  const jwtToken = await loginConfirmedUser.loginUser();
  const res = await request(app)
    .get(`/api/v1/events/${testEvent2ID}`)
    .set('authorization', `Bearer ${jwtToken}`)
    .expect(200);
});
test('Check get the event with the id and the event is private by link ', async () => {
  const jwtToken = await loginConfirmedUser.loginUser();
  const res = await request(app)
    .get(`/api/v1/events/${testEvent2ID}`)
    .set('authorization', `Bearer ${jwtToken}`)
    .expect(200);
});
test('Check get the event with the id and the event is private with password ', async () => {
  const jwtToken = await loginConfirmedUser.loginUser();
  const res = await request(app)
    .get(`/api/v1/events/${testEvent3ID}`)
    .set('authorization', `Bearer ${jwtToken}`)
    .expect(401);
  expect(res.body.message).toMatch('You must enter the event password');
});
test('Check get the event with the ivalid  id  ', async () => {
  const jwtToken = await loginConfirmedUser.loginUser();
  const res = await request(app)
    .get(`/api/v1/events/642353890eb1f15e654930f1`)
    .set('authorization', `Bearer ${jwtToken}`)
    .expect(404);
  expect(res.body.message).toMatch('No such event found with id');
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  // Delete all test data and close the database connection
  await mongoose.connection.close();
});
