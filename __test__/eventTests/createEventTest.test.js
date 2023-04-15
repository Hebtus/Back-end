const request = require('supertest');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const app = require('../../app');
const Event = require('../../models/eventModel');

dotenv.config({ path: './config.env' });

const DBstring = process.env.TEST_DATABASE;
// Define variables for the test objects
let testUser;
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
test('Check created successfully', async () => {
  const res = await request(app)
    .post('/api/v1/events')
    .send({
      name: 'Atlanta Party',
      type: 'Regular',
      creatorID: testUser._id,
      startDate: '2023-11-4 1:04:00',
      endDate: '2024-02-22 12:00:00',
      locationName: 'Cairo University',
      category: 'Music',
      privacy: false,
      tags: ['lol', 'loler', 'hehe'],
    })
    .expect(200);
  expect(res.body.message).toMatch('event created successfully');
});

afterAll(async () => {
  // Delete all test data and close the database connection
  //await User.deleteMany();
  //await Event.deleteMany();
  await mongoose.connection.close();
});
