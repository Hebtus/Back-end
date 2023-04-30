const request = require('supertest');

// const session = require('express-session');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const Event = require('../../models/eventModel');
// const seeder = require('../../seeds/seeder');
const app = require('../../app');
const { doesNotMatch } = require('assert');
// const app = require('../../utils/config/config.env');
const testEventSeeder = require('../testutils/testeventSeeds');

dotenv.config({ path: './config.env' });

const DBstring = process.env.TEST_DATABASE;
let userID = '';

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
  // await mongoose.connection.collection('users').deleteMany({});
  const user = await User.create({
    name: {
      firstName: 'yasmina',
      lastName: 'hashem',
    },
    email: 'user70@gmail.com',
    password: '12345678',
  });
  userID = user._id;
});
test('Check GeoQuery Works Correctly: Events Within range  ', async () => {
  const testEvents = testEventSeeder.eventsWithinUserRange([userID]);
  await Event.create(testEvents);
  const res = await request(app).get('/api/v1/events').send().expect(200);
  expect(res.body.data.events.length).toEqual(20);

  await Event.deleteMany();
  await User.deleteMany();
});

test('Check GeoQuery Works Correctly: Events Out of range  ', async () => {
  const testEvents = testEventSeeder.eventsNotWithinRange([userID]);
  await Event.create(testEvents);
  const res = await request(app).get('/api/v1/events').send().expect(200);
  expect(res.body.data.events.length).toEqual(0);
  console.log('res', res.body);

  await User.deleteMany();
  await Event.deleteMany();
});

test('Check StartDate Works Correctly: Events Not Within  Date  ', async () => {
  const testEvents = testEventSeeder.eventsNotWithinRange([userID]);
  await Event.create(testEvents);
  const res = await request(app)
    .get(
      '/api/v1/events?startDate=2023-05-10T10:16:10.467z&endDate=2023-05-11T15:16:10.467z'
    )
    .send()
    .expect(200);
  expect(res.body.data.events.length).toEqual(0);
  console.log('res', res.body);

  await User.deleteMany();
  await Event.deleteMany();
});

test('Check StartDate Works Correctly: Events Within  Date  ', async () => {
  const startDate = new Date('2023-05-2');
  const endDate = new Date('2023-05-13');
  const testEvents = testEventSeeder.eventsWithinDateRange(
    [userID],
    startDate,
    endDate
  );
  await Event.create(testEvents);
  const res = await request(app)
    .get(
      '/api/v1/events/?startDate=2023-05-09T10:16z&endDate=2023-05-11T15:00z'
    )
    .send()
    .expect(200);
  expect(res.body.data.events.length).toEqual(10);
  console.log('res', res.body);
  await Event.deleteMany();
});

test('Check Location Querying Works Correctly  ', async () => {
  const newEvent = {
    name: `event${1}`,
    location: {
      coordinates: [80, 30],
    },
    category: ['Music', 'Food & Drink', 'Charity & Causes'][0],
    creatorID: userID,
    draft: false,
    privacy: false,
    startDate: new Date('2023-05-2'),
    endDate: new Date('2023-05-13'),
  };
  await Event.create(newEvent);
  const res = await request(app)
    .get('/api/v1/events/?location=80,30')
    .send()
    .expect(200);
  expect(res.body.data.events.length).toEqual(1);
  console.log('res', res.body);
});

afterAll(async () => {
  // await mongoose.connection.collection('users').deleteMany({});
  await User.deleteMany();
  await Event.deleteMany();
  mongoose.disconnect();
});
