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

test('check ticket created succsessfuly', async () => {
  const res = await request(app)
    .post('/api/v1/tickets')
    .send({
      eventID: '6432a915e24e5e5cf2781183',
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
  mongoose.disconnect();
});
