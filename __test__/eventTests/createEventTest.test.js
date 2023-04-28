// const request = require('supertest');
// const dotenv = require('dotenv');
// const mongoose = require('mongoose');
// const User = require('../../models/userModel');
// const app = require('../../app');
// const Event = require('../../models/eventModel');
// const loginConfirmedUser = require('../testutils/loginConfirmedUser');
// const createConfirmedUser = require('../testutils/createConfirmedUser');

test('', () => {});

// dotenv.config({ path: './config.env' });

// const DBstring = process.env.TEST_DATABASE;

// beforeAll(async () => {
//   // await User.deleteMany();
//   console.log('testDb is ', process.env.TEST_DATABASE);
//   await mongoose
//     .connect(DBstring, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     })
//     .then(() => {
//       console.log('TestDB is connected successfuly!');
//     });
//   await mongoose.connection.db.dropDatabase();
// });

// test('Check created successfully', async () => {
//   const user = await createConfirmedUser.createTestUser();
//   const jwtToken = await loginConfirmedUser.loginUser();

//   const filePath = `${__dirname}/testFiles/testimg.jpg`;

//   const res = await request(app)
//     .post('/api/v1/events')
//     .attach('file', filePath)
//     .set('authorization', `Bearer ${jwtToken}`)
//     .send({
//       name: 'loleventxd',
//       startDate: '2023-05-01T00:00:00.000Z',
//       endDate: '2023-05-03T00:00:00.000Z',
//       privacy: false,
//       password: '',
//       draft: false,
//       category: 'Music',
//       locationName: 'Cairo University',
//     })
//     .expect(200);
//   expect(res.body.message).toMatch('event created successfully');
// });

// afterAll(async () => {
//   // Delete all test data and close the database connection
//   await User.deleteMany();
//   await Event.deleteMany();
//   await mongoose.connection.close();
// });
