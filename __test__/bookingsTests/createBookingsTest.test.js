const request = require('supertest');
// const session = require('express-session');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Booking = require('../../models/bookingModel');
const Ticket = require('../../models/ticketModel');

const PromoCode = require('../../models/promoCodeModel');
const app = require('../../app');
const { doesNotMatch } = require('assert');
// const app = require('../../utils/config/config.env');

dotenv.config({ path: './config.env' });

const DBstring = process.env.TEST_DATABASE;
let ticket1ID;
let ticket2ID;
let reqBody1;
let reqBody2;

beforeAll(async () => {
  // await User.deleteMany();
  console.log('testDb is ', DBstring);
  await mongoose
    .connect(DBstring, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('TestDB is connected successfuly!');
    });
  await mongoose.connection.collection('promocodes').deleteMany({});
  //await mongoose.connection.db.dropDatabase();
  const promoCode = await PromoCode.create({
    codeName: 'mono',
    discountOrPercentage: 0,
    limits: 10,
    eventID: '64235403b361ed50a4419f60',
    percentage: 10,
  });
  const ticket1 = await Ticket.create({
    eventID: '64235403b361ed50a4419f60',
    name: 'Premium',
    type: 'VIP',
    price: 100,
    capacity: 20,
    sellingStartTime: '2027-02-21 12:00:00',
    sellingEndTime: '2028-02-22 12:00:00',
  }).then((doc) => {
    console.log(doc);
    ticket1ID = doc.id;
  });
  const ticket2 = await Ticket.create({
    eventID: '64235403b361ed50a4419f60',
    name: 'Normal Seat',
    type: 'VIP',
    price: 50,
    capacity: 90,
    sellingStartTime: '2027-02-21 12:00:00',
    sellingEndTime: '2028-02-22 12:00:00',
  }).then((doc) => {
    ticket2ID = doc.id;
  });
  reqBody1 = {
    userID: '642deb80b1aba5ec6366f9a7',

    name: {
      firstName: 'John',
      lastName: 'Smither',
    },
    guestEmail: 'canbeDifferentFromuserEmail@gmail.com',
    phoneNumber: '01030486357',
    gender: 'Male',
    promoCode: 'mono',
    bookings: [
      {
        ticketID: ticket1ID,
        price: 100,
        quantity: 1,
      },
      {
        ticketID: ticket2ID,
        price: 50,
        quantity: 1,
      },
    ],
  };
  reqBody2 = reqBody1;
  reqBody2.promoCode = 'noproblema';
});
beforeEach(() => {
  console.log(reqBody1.promoCode);
});

test('Check bookings with valid data', async () => {
  const res = await request(app)
    .post('/api/v1/bookings/')
    .send(reqBody1)
    .expect(200);

  //console.log(res.body.messages, 'lol');
  //expect(res.body.message).toMatch('Please provide email and password!');
});
test('Check that bookings date is  invalid', async () => {
  const res = await request(app)
    .post('/api/v1/bookings/')
    .send(reqBody1)
    .expect(400);
  //expect(res.body.message).toMatch('Invalid promo code provided');
});

test('Check that promocode invalid', async () => {
  const res = await request(app)
    .post('/api/v1/bookings/')
    .send(reqBody2)
    .expect(404);
  // expect(res.body.message).toMatch('Invalid promo code provided');
});

afterAll(async () => {
  // await mongoose.connection.collection('users').deleteMany({});
  await PromoCode.deleteMany();
  await Booking.deleteMany();
  mongoose.disconnect();
});

// const request = require('supertest');
// const mongoose = require('mongoose');
// const app = require('../../app');
// const Booking = require('../../models/bookingModel');
// const { createBookings } = require('../../controllers/bookingController');
// const { catchAsync } = require('../../utils/catchAsync');

// // Mock request and response objects
// const req = {
//   body: {
//     promoCode: 'BoeJiden',
//     bookings: [
//       { ticketID: '64342564a0d9909b76cd5cbe', price: 100, quantity: 1 },
//       { ticketID: '6438762191a7fe35e4bffd92', price: 50, quantity: 1 },
//     ],
//     name: {
//       firstName: 'John',
//       lastName: 'Smither',
//     },
//     userID: '642deb80b1aba5ec6366f9a7',
//     guestEmail: 'john.doe@example.com',
//     gender: 'Male',
//     phoneNumber: '01030486357',
//   },
// };
// const res = {
//   status: jest.fn(() => res),
//   json: jest.fn(),
// };

// // Mock next middleware function
// const next = jest.fn();

// describe('createBookings', () => {
//   beforeAll(async () => {
//     await mongoose.connect(process.env.TEST_DATABASE, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     await mongoose.connection.db.dropDatabase();
//   });

//   afterAll(async () => {
//     await mongoose.connection.close();
//   });

//   test('It should create bookings with valid input', async () => {
//     const totalPrice = 135;
//     const bookings = [
//       { ticketID: '64342564a0d9909b76cd5cbe', price: 90, quantity: 1 },
//       { ticketID: '6438762191a7fe35e4bffd92', price: 45, quantity: 1 },
//     ];
//     const createSpy = jest.spyOn(Booking, 'create').mockResolvedValueOnce();

//     await createBookings(req, res, next);

//     expect(createSpy).toHaveBeenCalledWith([
//       {
//         ticketID: '64342564a0d9909b76cd5cbe',
//         price: 90,
//         quantity: 1,
//         name: {
//           firstName: 'John',
//           lastName: 'Smither',
//         },
//         userID: '642deb80b1aba5ec6366f9a7',
//         guestEmail: 'john.doe@example.com',
//         gender: 'Male',
//         phoneNumber: '01030486357',
//       },
//       {
//         ticketID: '6438762191a7fe35e4bffd92',
//         price: 45,
//         quantity: 1,
//         name: {
//           firstName: 'John',
//           lastName: 'Smither',
//         },
//         userID: '642deb80b1aba5ec6366f9a7',
//         guestEmail: 'john.doe@example.com',
//         gender: 'Male',
//         phoneNumber: '01030486357',
//       }
//     ]);
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({
//       status: 'success',
//       totalPrice,
//       data: bookings,
//     });
//   });

//   test('should return error for invalid promo code', async () => {
//     const invalidPromoCodeReq = {
//       body: {
//         promoCode: 'invalid_promo_code',
//         bookings: [],
//       }
//     };
//     const invalidPromoCodeRes = {
//       status: jest.fn(() => invalidPromoCode
// test('should call next middleware function for any error during bookings creation', async () => {
// const error = new Error('Test error');
// jest.spyOn(Booking, 'create').mockRejectedValueOnce(error);
