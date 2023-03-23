const request = require('supertest');
// const session = require('express-session');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const app = require('../../app');
const { doesNotMatch } = require('assert');
// const app = require('../../utils/config/config.env');
const createConfirmedUser = require('../testutils/createConfirmedUser');
const loginConfirmedUser = require('../testutils/loginConfirmedUser');

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
  await mongoose.connection.collection('users').deleteMany({});
});
// jest.setTimeout(60000);
test('Check User Logout', async () => {
  //creates test user who is confirmed // avoids sending emails w keda
  await createConfirmedUser.createTestUser();
  const jwtToken = await loginConfirmedUser.loginUser();

  const res = await request(app)
    .get('/api/v1/logout')
    .set('authorization', `Bearer ${jwtToken}`)
    .send()
    .expect(200);
  expect(res.headers['set-cookie']).toBeDefined();
  // console.log(res.headers);
  let newjwtToken = res.headers['set-cookie'];
  const newTokenArr = String(newjwtToken).split(';');
  let newDate = newTokenArr[2];
  // console.log('newDate is ', newDate);
  newjwtToken = newTokenArr[0].slice(4);

  //now we try logout again whic has protected status
  await request(app)
    .get('/api/v1/logout')
    //Well what would happen in the browswer is that the token is removed,
    //but we also handled the case where the token follows the structure but is invalid
    // this produces an app error in try catch block
    .set('authorization', `Bearer ${newjwtToken}`)
    .send({
      email: 'irushbullet@gmail.com',
      password: '123456789',
    })
    .expect(401); //handles the very famous error //that was about to cast our progress to darkness
});

afterAll(async () => {
  // await mongoose.connection.collection('users').deleteMany({});
  // await User.deleteMany();
  mongoose.disconnect();
});
