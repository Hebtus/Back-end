const request = require('supertest');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const app = require('../../app');
const Event = require('../../models/eventModel');
const Booking = require('../../models/bookingModel');
const Ticket = require('../../models/ticketModel');
const loginConfirmedUser = require('../testutils/loginConfirmedUser');
const createConfirmedUser = require('../testutils/createConfirmedUser');

dotenv.config({ path: './config.env' });

const DBstring = process.env.TEST_DATABASE;
let user1id = '';
let testEvent;
let testBooking;
let testTicket;

beforeAll(async () => {
  // await User.deleteMany();
  console.log('testDb is ', process.env.TEST_DATABASE);
  await mongoose
    .connect(DBstring, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('TestDB is connected successfuly!');
    });
  await mongoose.connection.db.dropDatabase();
});
test('Check entering wrong event id', async () => {
  const user = await createConfirmedUser.createTestUser();
  const jwtToken = await loginConfirmedUser.loginUser();
  user1id = user._id;
  const res = await request(app)
    .get('/api/v1/events/642fda172c9619b9850f7102/bookings?page=1&limit=10')
    .set('authorization', `Bearer ${jwtToken}`)
    .send()
    .expect(404);
  expect(res.body.message).toMatch('No event found with this id ');
});
test('Check success', async () => {
  const jwtToken = await loginConfirmedUser.loginUser();
  testEvent = new Event({
    name: 'loleventxd',
    startDate: Date.now() - 1000 * 60 * 60 * 24 * 10,
    endDate: Date.now() + 1000 * 60 * 60 * 24 * 10, //after 10 days
    privacy: false,
    draft: false,
    category: 'Music',
    creatorID: user1id,
  });
  await testEvent.save();
  testTicket = new Ticket({
    name: '2a3det 4ayTicket',
    type: 'Regular',
    price: 100,
    capacity: 10,
    sellingStartTime: Date.now() + 1000 * 60 * 60 * 24 * 1,
    sellingEndTime: Date.now() + 1000 * 60 * 60 * 24 * 2,
    eventID: testEvent._id,
  });
  await testTicket.save();
  testBooking = new Booking({
    name: { firstName: 'lol', lastName: 'attendeelastname' },
    gender: 'Male',
    phoneNumber: 12345678910,
    guestEmail: 'irushbullet@google.com',
    eventID: testEvent._id,
    userID: '642e4b8a1ba39c145cf15843',
    ticketID: testTicket._id,
    price: 100,
    quantity: 2,
    purchasedOn: Date.now(),
  });
  await testBooking.save();
  const res = await request(app)
    .get(`/api/v1/events/${testEvent._id}/bookings?page=1&limit=10`)
    .set('authorization', `Bearer ${jwtToken}`)
    .send()
    .expect(200);
  expect(res.body.status).toMatch('success');
});

test('Check creator accessing non of his events', async () => {
  await createConfirmedUser.createTestUser2();
  const jwtToken2 = await loginConfirmedUser.loginUser2();
  const res = await request(app)
    .get(`/api/v1/events/${testEvent._id}/bookings?page=1&limit=10`)
    .set('authorization', `Bearer ${jwtToken2}`)
    .send()
    .expect(401);
  expect(res.body.message).toMatch(
    'You cannot access events that are not yours'
  );
});

afterAll(async () => {
  // Delete all test data and close the database connection
  await User.deleteMany();
  await Event.deleteMany();
  await mongoose.connection.close();
});
