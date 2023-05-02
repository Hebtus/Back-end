const request = require('supertest');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const app = require('../../app');
const Event = require('../../models/eventModel');
const loginConfirmedUser = require('../testutils/loginConfirmedUser');
const createConfirmedUser = require('../testutils/createConfirmedUser');

// test('', () => {});

dotenv.config({ path: './config.env' });

const DBstring = process.env.TEST_DATABASE;
jest.setTimeout(20000);
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

test('Check created successfully with image', async () => {
  const user = await createConfirmedUser.createTestUser();
  const jwtToken = await loginConfirmedUser.loginUser();

  const filePath = `${__dirname}/testFiles/testimg.jpg`;
  console.log('filePath is ', filePath);
  const res = await request(app)
    .post('/api/v1/events')
    .attach('image', filePath)
    .set('authorization', `Bearer ${jwtToken}`)
    .field('name', 'loleventxd')
    .field('startDate', Date.now() + 1000000)
    .field('endDate', Date.now() + 1500000)
    .field('privacy', false)
    .field('draft', false)
    .field('category', 'Music')
    .field('locationName', 'Cairo University')
    .field('location', '31.2107164, 30.0246686')
    .expect(200);
  expect(res.body.status).toMatch('success');
});

test('Check created successfully without image', async () => {
  const jwtToken = await loginConfirmedUser.loginUser();

  const res = await request(app)
    .post('/api/v1/events')
    .set('authorization', `Bearer ${jwtToken}`)
    .field('name', 'loleventxd2')
    .field('startDate', Date.now() + 1000000)
    .field('endDate', Date.now() + 1500000)
    .field('privacy', false)
    .field('draft', false)
    .field('category', 'Music')
    .field('locationName', 'Cairo University')
    .field('location', '31.2107164, 30.0246686')
    .expect(200);
  expect(res.body.status).toMatch('success');
});

test('Check failure in creating event with a non supported category', async () => {
  const jwtToken = await loginConfirmedUser.loginUser();

  const res = await request(app)
    .post('/api/v1/events')
    .set('authorization', `Bearer ${jwtToken}`)
    .field('name', 'loleventxd2')
    .field('startDate', Date.now() + 1000000)
    .field('endDate', Date.now() + 1500000)
    .field('privacy', false)
    .field('draft', false)
    .field('category', 'food')
    .field('locationName', 'Cairo University')
    .field('location', '31.2107164, 30.0246686')
    .expect(400);
  expect(res.body.message).toMatch(
    'Event validation failed: category: food is not supported in event categories'
  );
});

test('Check failure in creating event without one of the required fileds (eg. startDate)', async () => {
  const jwtToken = await loginConfirmedUser.loginUser();

  const res = await request(app)
    .post('/api/v1/events')
    .set('authorization', `Bearer ${jwtToken}`)
    .field('name', 'loleventxd2')
    .field('endDate', Date.now() + 1500000)
    .field('privacy', false)
    .field('draft', false)
    .field('category', 'Music')
    .field('locationName', 'Cairo University')
    .field('location', '31.2107164, 30.0246686')
    .expect(400);
  expect(res.body.message).toMatch(
    'Event validation failed: startDate: An event must have a start date.'
  );
});
afterAll(async () => {
  // Delete all test data and close the database connection
  await User.deleteMany();
  await Event.deleteMany();
  await mongoose.connection.close();
});
