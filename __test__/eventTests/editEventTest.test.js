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
let testUser2;
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
  testUser2 = new User({
    name: {
      firstName: 'loler',
      lastName: 'Ameer',
    },
    email: 'lol@lol.com',
    location: { coordinates: [-91.32, 1.32] },
    password: '123456789',
    passwordChangedAt: '1987-09-28 20:01:07',
  });
  await testUser2.save();

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
test('Check entering wrong event id', async () => {
  const res = await request(app)
    .patch('/api/v1/events/643628373b9b084e498a026a')
    .send({
      description: 'Very enjoyable event',
      tags: ['lol', 'loler', 'hehe'],
      goPublicDate: Date.now(),
    })
    .expect(404);
  expect(res.body.message).toMatch('No event found with this id');
});
// test('Check creator accessing non of his events', async () => {
//   const res = await request(app)
//     .patch('/api/v1/events/643628373b9b084e498a026a')
//     .send({
//       description: 'Very enjoyable event',
//       tags: ['lol', 'loler', 'hehe'],
//       goPublicDate: Date.now(),
//     })
//     .expect(404);
//   expect(res.body.message).toMatch('You cannot edit events that are not yours');
// });
test('Check edited successfully', async () => {
  const res = await request(app)
    .patch(`/api/v1/events/${testEvent.id}`)
    .send({
      description: 'Very enjoyable event',
      tags: ['lol', 'loler', 'hehe'],
      goPublicDate: Date.now(),
    })
    .expect(404);
  expect(res.body.message).toMatch('success');
});

afterAll(async () => {
  // Delete all test data and close the database connection
  //await User.deleteMany();
  //await Event.deleteMany();
  await mongoose.connection.close();
});
