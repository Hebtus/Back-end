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
  expect(auxres.headers['set-cookie']).toBeDefined();
  let jwtToken = auxres.headers['set-cookie'];
  let TokenArr = String(jwtToken).split(';');
  // let oldDate = TokenArr[2];
  // console.log(oldDate);
  jwtToken = String(jwtToken).split(';')[0].slice(4);
  // console.log(jwtToken);
  return jwtToken;
};
