const User = require('../../models/userModel');
const request = require('supertest');
const app = require('../../app');

//creates our hamada who we all know for testing purposes
exports.loginUser = async () => {
  const auxres = await request(app)
    .post('/api/v1/login')
    .send({
      email: 'irushbullet@gmail.com',
      password: '123456789',
    })
    .expect(200);
  let jwtToken = auxres.body.token;
  return jwtToken;
};

exports.loginUser2 = async () => {
  const auxres = await request(app)
    .post('/api/v1/login')
    .send({
      email: 'irushbulleter@gmail.com',
      password: '123456789',
    })
    .expect(200);
  let jwtToken = auxres.body.token;
  return jwtToken;
};
