const request = require('supertest');
const session = require('express-session');
const User = require('../models/userModel');
const app = require('./app');

beforeEach(async () => {
  await User.deleteMany();
});

test('Check User Login with wrong password', async ()=>{
    await User.create({
        name:{
            firstName:'yasmina',
            lastName:'hashem'
        },
        email:"user70@gmail.com",
        password:"123456",
        
        
    })
    const res=await request(app).post('/login')
    .send({
        email:"user70@gmail.com",
        password:"12jhfd36"
    })
    .expect(400)
    expect(res.text).toMatch('Incorrect email or password!')
})