const request = require('supertest');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const app = require('../../app');
const Event = require('../../models/eventModel');
const Ticket = require('../../models/ticketModel');
const Booking = require('../../models/bookingModel');

dotenv.config({ path: './config.env' });

const DBstring = process.env.TEST_DATABASE;

let testUser;
let testEvent;

beforeAll(async () => {
  // Connect to the test database
  await mongoose.connect(DBstring, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Create a test user and save to the database
  testUser = new User({
    name: {
      firstName: 'loler',
      lastName: 'Ameer',
    },
    email: 'lol@lol.com',
    location: { coordinates: [-91.32, 1.32] },
    password: '123456789',
    passwordChangedAt: '1987-09-28 20:01:07',
  });
  await testUser.save();

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
});

test('Check invalid event parameter', async () => {
  const res = await request(app)
    .get('/api/v1/creators/events/6432a915e24e555cf2781183/tickets')
    .expect(404);
  expect(res.body.message).toMatch('Invalid event or creator.');
});

test('Check valid event parameter', async () => {
  const res = await request(app)
    .get(`/api/v1/creators/events/${testEvent._id}/tickets`)
    .expect(200);
  expect(res.body.status).toMatch('success');
});

afterAll(async () => {
  // Delete all test data and close the database connection
  await User.deleteMany();
  await Event.deleteMany();
  await Ticket.deleteMany();
  await Booking.deleteMany();
  await mongoose.connection.close();
});
