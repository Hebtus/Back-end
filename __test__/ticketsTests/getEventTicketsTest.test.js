const request = require('supertest');
// const session = require('express-session');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { doesNotMatch } = require('assert');
const User = require('../../models/userModel');
const app = require('../../app');
const Event = require('../../models/eventModel');
const Ticket = require('../../models/ticketModel');
const Booking = require('../../models/bookingModel');
// dotenv.config({ path: './utils/config/config.env' });
dotenv.config({ path: './config.env' });

const DBstring = process.env.TEST_DATABASE;

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
  await mongoose.connection.db.dropDatabase();
});
test('Check invalid eventid parameter', async () => {
  const res = await request(app)
    .get('/api/v1/events/6432a915e24e5e5cf2781183/tickets')
    .expect(404);
  expect(res.body.message).toMatch('invalid eventID');
});

afterAll(async () => {
  mongoose.disconnect();
});
