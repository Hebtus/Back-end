const request = require('supertest');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { doesNotMatch } = require('assert');
const User = require('../../models/userModel');
const app = require('../../app');

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
  const user = await User.create({
    name: {
      firstName: 'yasmina',
      lastName: 'hashem',
    },
    email: 'user70@gmail.com',
    password: '12345678',
  });

  test('Check User input mismatched password confirm', async () => {
    const res = await request(app)
      .patch('/api/v1/deactivate')
      .send({
        password: '12345678',
        confirmPassword: 'kambotchas',
      })
      .expect(401);
    expect(res.body.message).toMatch('confirm password doesnt match');
    // console.log(res);
    // done();
  });

  test('Check User input inCorrect password', async () => {
    const res = await request(app)
      .patch('/api/v1/deactivate')
      .send({
        password: 'kambotchas',
        confirmPassword: 'kambotchas',
      })
      .expect(401);
    expect(res.body.message).toMatch('Your current password is wrong.');
    // console.log(res);
    // done();
  });

  test('Check successful deactivation', async () => {
    const res = await request(app)
      .patch('/api/v1/deactivate')
      .send({
        password: '12345678',
        confirmPassword: '12345678',
      })
      .expect(401);
    expect(res.body.message).toMatch('Account deactivated.');
    // console.log(res);
    // done();
  });

 
});
