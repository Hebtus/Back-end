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
const password = '123456789';
let testEvent1;

let testEvent1ID;

beforeAll(async () => {
  // Connect to the test database
  await mongoose.connect(DBstring, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const testUser = await createConfirmedUser.createTestUser();
  testEvent1 = {
    name: 'loleventxd',
    startDate: Date.now() - 1000 * 60 * 60 * 24 * 10,
    endDate: Date.now() + 1000 * 60 * 60 * 24 * 10, //after 10 days
    privacy: false,
    draft: false,
    category: 'Music',
    creatorID: testUser._id,
    password: password,
  };

  await Event.create(testEvent1).then((doc) => (testEvent1ID = doc.id));

  // Create a test event and save to the database
});

test('Check get the event with the id and the event is private with password ', async () => {
  const jwtToken = await loginConfirmedUser.loginUser();
  const res = await request(app)
    .post(`/api/v1/events/${testEvent1ID}`)
    .set('authorization', `Bearer ${jwtToken}`)
    .send({ password: password })
    .expect(200);
});

test('Check get the event with the invalid  password  ', async () => {
  const jwtToken = await loginConfirmedUser.loginUser();
  const res = await request(app)
    .post(`/api/v1/events/${testEvent1ID}`)
    .set('authorization', `Bearer ${jwtToken}`)
    .send({ password: '91516325652' })
    .expect(404);
  expect(res.body.message).toMatch('Invalid password');
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  // Delete all test data and close the database connection
  await mongoose.connection.close();
});
