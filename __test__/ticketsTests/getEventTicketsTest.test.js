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

let testEvent;

beforeAll(async () => {
  // Connect to the test database
  await mongoose.connect(DBstring, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

test('Check invalid eventid parameter', async () => {
  const testUser = await createConfirmedUser.createTestUser();
  const jwtToken = await loginConfirmedUser.loginUser();
  
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
  const res = await request(app)
    .get(`/api/v1/events/${testEvent._id}/tickets`)
    .set('authorization', `Bearer ${jwtToken}`)
    .expect(200);
});

afterAll(async () => {
  // Delete all test data and close the database connection
  await User.deleteMany();
  await Event.deleteMany();
  await Ticket.deleteMany();
  await Booking.deleteMany();
  await mongoose.connection.close();
});
