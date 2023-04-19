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
const testEventSeeder = require('../testutils/testeventSeeds');
dotenv.config({ path: './config.env' });

const DBstring = process.env.TEST_DATABASE;
let user;
let user1id = '';
let jwtToken;
let testEvent;

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
  user = await createConfirmedUser.createTestUser();
  jwtToken = await loginConfirmedUser.loginUser();
  //create events in past and future
  testEvent = new Event({
    name: 'loleventxd',
    startDate: Date.now() - 1000 * 60 * 60 * 24 * 10,
    endDate: Date.now() + 1000 * 60 * 60 * 24 * 10, //after 10 days
    privacy: false,
    draft: false,
    category: 'Music',
    creatorID: user._id,
  });
  await testEvent.save();
  const testTicket = new Ticket({
    name: 'lolTicketxd',
    type: 'VIP',
    price: 10,
    capacity: 10,
    sellingStartTime: Date.now() + 1000 * 60 * 60 * 24 * 10, //to pass validation
    sellingEndTime: Date.now() + 1000 * 60 * 60 * 24 * 11,
    eventID: testEvent._id,
  });
  await testTicket.save({ validateBeforeSave: false }); //to Pass sellingStartTime validation
  const testBooking = new Booking({
    userID: user._id,
    ticketID: testTicket._id,
    eventID: testEvent._id,
    quantity: 1,
    price: 10,
    guestEmail: 'loler@gmail.com',
    phoneNumber: '12345678910',
    gender: 'Male',
  });
  await testBooking.save();
});

test('Check Delete Event Works Correctly', async () => {
  const res = await request(app)
    .delete(`/api/v1/creators/events/${testEvent._id}`)
    .set('authorization', `Bearer ${jwtToken}`)
    .send();

  const currentEvents = await Event.find();
  const currentTickets = await Ticket.find();
  const currentBookings = await Booking.find();
  expect(currentEvents.length).toEqual(0);
  expect(currentTickets.length).toEqual(0);
  expect(currentBookings.length).toEqual(0);

  //   expect(res.body.data.events.length).toEqual(0);
});

afterAll(async () => {
  // Delete all test data and close the database connection
  // await User.deleteMany();
  // await Event.deleteMany();
  await mongoose.connection.close();
});
