const request = require('supertest');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const app = require('../../app');
const Event = require('../../models/eventModel');
const Ticket = require('../../models/ticketModel');
const loginConfirmedUser = require('../testutils/loginConfirmedUser');
const createConfirmedUser = require('../testutils/createConfirmedUser');
const testEventSeeder = require('../testutils/testeventSeeds');
dotenv.config({ path: './config.env' });

const DBstring = process.env.TEST_DATABASE;
let user;
let jwtToken;
let jwtToken2;

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
  await createConfirmedUser.createTestUser2();
  jwtToken2 = await loginConfirmedUser.loginUser2();
  //create events in past and future
  const pastEvents = await testEventSeeder.eventsWithGivenDateRange(
    [user._id],
    '1-1-2001',
    '1-1-2002'
  );
  await Event.create(pastEvents);
  const futuerEvents = await testEventSeeder.eventsWithGivenDateRange(
    [user._id],
    Date.now() + 1000 * 60 * 60 * 24 * 10,
    Date.now() + 1000 * 60 * 60 * 24 * 20
  );
  await Event.create(futuerEvents);
});
test('Check Getting all Events Matches creator correctly', async () => {
  const res = await request(app)
    .get('/api/v1/creators/events')
    .set('authorization', `Bearer ${jwtToken2}`)
    .send();
  expect(res.body.data.events.length).toEqual(0);
});

test('Check Getting all events returns all events correctly', async () => {
  const res = await request(app)
    .get('/api/v1/creators/events/?limit=20')
    .set('authorization', `Bearer ${jwtToken}`)
    .send();
  expect(res.body.data.events.length).toEqual(20);
});

test('Check Getting all events in past works correctly', async () => {
  const res = await request(app)
    .get('/api/v1/creators/events/?time=past')
    .set('authorization', `Bearer ${jwtToken}`)
    .send();
  expect(res.body.data.events.length).toEqual(10);
  for (const event of res.body.data.events) {
    const eventEndDate = Date.parse(event.endDate);
    expect(eventEndDate).toBeLessThan(Date.now());
  }
});

test('Check Getting all events in future works correctly', async () => {
  const res = await request(app)
    .get('/api/v1/creators/events/?time=future')
    .set('authorization', `Bearer ${jwtToken}`)
    .send();
  expect(res.body.data.events.length).toEqual(10);
  for (const event of res.body.data.events) {
    const eventStartDate = Date.parse(event.startDate);
    expect(eventStartDate).toBeGreaterThan(Date.now());
  }
});

test('Check that all of them are unavailable because there are no tickets associated', async () => {
  const res = await request(app)
    .get('/api/v1/creators/events/')
    .set('authorization', `Bearer ${jwtToken}`)
    .send();
  expect(res.body.data.events.length).toEqual(20);
  for (const event of res.body.data.events) {
    expect(event.ticketsAvailable).toEqual('0');
  }
});

test('Check that avaialableTickets functionality works', async () => {
  await Event.deleteMany();
  const testEvent = new Event({
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
    sellingStartTime: Date.now() - 1000 * 60 * 60 * 24 * 10, //to pass validation
    sellingEndTime: Date.now() + 1000 * 60 * 60 * 24 * 10,
    eventID: testEvent._id,
  });
  await testTicket.save({ validateBeforeSave: false }); //to Pass sellingStartTime validation

  const res = await request(app)
    .get('/api/v1/creators/events/')
    .set('authorization', `Bearer ${jwtToken}`)
    .send();

  expect(res.body.data.events.length).toEqual(1);
  for (const event of res.body.data.events) {
    expect(event.ticketsAvailable).toEqual('1');
  }
});

afterAll(async () => {
  // Delete all test data and close the database connection
  // await User.deleteMany();
  // await Event.deleteMany();
  await mongoose.connection.close();
});
