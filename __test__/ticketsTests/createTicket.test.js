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

// Define variables for the test objects
let testEvent;

beforeAll(async () => {
  // Connect to the test database
  await mongoose.connect(DBstring, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

//console.log(testEvent._id);
/*test('Check missing important parameters', async () => {
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
});*/

test('check ticket created successfully', async () => {
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
  console.log(testEvent._id);
  //console.log(testEvent._id);
  const res = await request(app)
    .post('/api/v1/tickets')
    .set('authorization', `Bearer ${jwtToken}`)
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
  //expect(res.body.message).toMatch('ticket created successfully');
});

afterAll(async () => {
  // Delete all test data and close the database connection
  await User.deleteMany();
  await Event.deleteMany();
  await Ticket.deleteMany();
  await Booking.deleteMany();
  mongoose.disconnect();
});
