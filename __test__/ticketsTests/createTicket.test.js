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

// Define variables for the test objects
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

test('Check missing important parameters', async () => {
  const res = await request(app)
    .post('/api/v1/tickets')
    .send({
      name: 'msh premium awi',
      type: 'Regular',
      price: 100,
      capacity: 20,
      sellingStartTime: '2023-11-4 1:04:00',
      sellingEndTime: '2024-02-22 12:00:00',
    })
    .expect(500);
  expect(res.body.message).toMatch('Ticket Type must belong to an event.');
});

test('check ticket created successfully', async () => {
  const res = await request(app)
    .post('/api/v1/tickets')
    .send({
      eventID: testEvent._id,
      name: 'msh premium awi',
      type: 'Regular',
      price: 100,
      capacity: 20,
      sellingStartTime: '2023-11-4 1:04:00',
      sellingEndTime: '2024-02-22 12:00:00',
    })
    .expect(200);
  expect(res.body.message).toMatch('ticket created successfully');
});

afterAll(async () => {
  // Delete all test data and close the database connection
  await User.deleteMany();
  await Event.deleteMany();
  await Ticket.deleteMany();
  await Booking.deleteMany();
  await mongoose.connection.close();
});