const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
const test = require('./__test__/testutils/createConfirmedUser');
const app = require('./app');
//Load config
dotenv.config({ path: '.config.env' });
const Seeder = require('./seeds/seeder');
// const cors = require('cors');
const User = require('./models/userModel');
const Event = require('./models/eventModel');
const Tickets = require('./models/ticketModel');
const Booking = require('./models/bookingModel');

// const corsOptions = {
//   origin: ['http://localhost:62383'],
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   // allowedHeaders: 'Token,Content-Type,Authorization,X-Forwarded-For',
//   credentials: true,
//   preflightContinue: true,
//   optionsSuccessStatus: 204,
// };
// app.use('*', cors(corsOptions));

//Database connection

// const now = new Date(Date.now());
// console.log('NowUTC-ed is ', now.toUTCString()); //output : Wed, 05 Apr 2023 15:44:40 GMT
// console.log('But now is ', now); //output 2023-04-05T15:44:40.984Z (ISO format)
// const nowUTC = new Date(now.toUTCString());
// console.log('Now UTC is ', nowUTC); //output 2023-04-05T15:44:40.984Z (ISO format)
// console.log(typeof now);
// now = now.toUTCString();

const DBstring =
  process.env.NODE_ENV === 'development'
    ? process.env.DATABASE_LOCAL
    : process.env.DATABASE_DEPLOY;

// Seeder(DBstring);

console.log('connecting to ', DBstring);
mongoose
  .connect(DBstring, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('DB is connected successfuly!');

    // await Event.create({
    //   name: 'test event',
    //   privacy: 'false',
    //   password: null,
    //   category: 'Music',
    //   creatorID: '642fda162c9619b9850f70f1',
    //   img_url: null || '',
    //   startDate: new Date(Date.now()),
    //   endDate: new Date(Date.now() + 100000000),
    //   locationName: 'Faculty of Engineering, Cairo University',
    //   tags: null,
    //   location: {
    //     coordinates: [
    //       faker.address.latitude(31.214039, 31.203095),
    //       faker.address.longitude(30.118752, 29.97293), //max min
    //     ],
    //   },
    // });

    //region Tester
    ////event testing/////
    // const name = 'test event';
    // const privacy = 'false';
    // const password = null;
    // const category = 'Music';
    // const startDate = new Date(Date.now());
    // const endDate = new Date(Date.now() + 100000000);
    // const locationName = 'Faculty of Engineering, Cairo University';
    // const locationcoordinates = [30.0444, 31.2357];
    // const tags = null;

    // await Event.create({
    //   name,
    //   privacy,
    //   password,
    //   category,
    //   creatorID: '642fda162c9619b9850f70f1',
    //   img_url: null || '',
    //   startDate,
    //   endDate,
    //   locationName,
    //   tags,
    //   location: { coordinates: locationcoordinates },
    // });
    // await Event.deleteMany({ name: 'test event' });
    //for testing and saving email creditsssssss
    //if no user create confirmed user
    // await User.deleteMany();
    // const anyuser = await User.find();
    // console.log(anyuser);
    // let user1;
    // let user2;
    // if (anyuser.length === 0) {
    //user1 = await test.createTestUser();
    //user2 = await test.createTestUser2();
    // }
    // const allbookings = await Booking.find();
    // console.log('allbookings is ', allbookings);

    // const myBooking = await Booking.find({ purchasedOn: { $lt: Date.now() } });
    // console.log('the booking I want  is ', myBooking);
    // console.log('the booking I want  is ', myBooking[0].purchasedOn);
    // console.log(myBooking[0].purchasedOn > Date.now());
    // if (anyuser.length === 0) {
    //   Seeder.Seed();
    // }
    // await mongoose.connection.db.dropDatabase();
    // test.createTestUser();
    // console.log('DB is removed successfuly!');
    // // // Schema Testing

    // const testEvent2 = new Event({
    //   name: 'lolerseventus',
    //   startDate: Date.now() + 1000 * 60 * 60 * 24 * 20,
    //   endDate: Date.now() + 1000 * 60 * 60 * 24 * 25, //after 10 days
    //   privacy: false,
    //   draft: false,
    //   category: 'Food & Drink',
    //   creatorID: user1._id,
    // });

    // const testEvent = new Event({
    //   name: 'loleventxd',
    //   startDate: Date.now() - 1000 * 60 * 60 * 24 * 10,
    //   endDate: Date.now() + 1000 * 60 * 60 * 24 * 10, //after 10 days
    //   privacy: false,
    //   draft: false,
    //   category: 'Music',
    //   creatorID: user1._id,
    // });

    // const testTickets = new Tickets({
    //   name: '2a3det 4ayTicket',
    //   type: 'Regular',
    //   price: 100,
    //   capacity: 10,
    //   sellingStartTime: Date.now() + 1000 * 60 * 60 * 24 * 1,
    //   sellingEndTime: Date.now() + 1000 * 60 * 60 * 24 * 2,
    // });
    /*
    const testBooking = new Booking({
      name: { firstName: 'lol', lastName: 'attendeelastname' },
      gender: 'Male',
      phoneNumber: 12345678910,
      guestEmail: 'irushbullet@google.com',
      userID:'642e4b8a1ba39c145cf15843',
      ticketID: '64349f5f23a2b28029e0443b',
      price: 100,
      quantity: 2,
      purchasedOn: Date.now(),
    });
    // await testEvent2.save();
    // await testEvent.save().then(async () => {
    //   testTickets.eventID = testEvent._id;
    //   await testTickets.save().then(() => {
    //     testBooking.ticketID = testTickets._id;
    testBooking.save();*/
    //   });
    // });
    //#endregion
  });

// console.log(Date.now());

// const testerfunc = async () => {
//   const testUser = new User({
//     name: {
//       firstName: 'loler',
//       lastName: 'Ameer',
//     },
//     email: 'lol@lol.com',
//     location: { coordinates: [-91.32, 1.32] },
//     password: '123456789',
//     passwordChangedAt: '1987-09-28 20:01:07',
//   });

//   await User.collection.drop();

//   await testUser
//     .save()
//     .then(() => {
//       console.log('Saved Successfully!!!!!!!');
//     })
//     .catch((err) => {
//       console.log(err);
//     });
//   const testgetuser = await User.findOne();
//   console.log(testgetuser);
// };
// testerfunc();

//Hosting the server
const server = app.listen(process.env.PORT, () => {
  console.log(`App is running on port ${process.env.PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  //shut down the server gracefully and then exit the process
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
