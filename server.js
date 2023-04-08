const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');
const test = require('./__test__/testutils/createConfirmedUser');
//Load config
dotenv.config({ path: '.config.env' });
const Seeder = require('./seeds/seeder');
const cors = require('cors');
const User = require('./models/userModel');
const Event = require('./models/eventModel');
const Tickets = require('./models/ticketModel');
const Booking = require('./models/bookingModel');

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Token,Content-Type,Authorization,X-Forwarded-For',
  credentials: true,
  preflightContinue: true,
  optionsSuccessStatus: 204,
};
app.use('*', cors(corsOptions));

//Database connection

// const now = new Date(Date.now());
// console.log('NowUTC-ed is ', now.toUTCString()); //output : Wed, 05 Apr 2023 15:44:40 GMT
// console.log('But now is ', now); //output 2023-04-05T15:44:40.984Z (ISO format)
// const nowUTC = new Date(now.toUTCString());
// console.log('Now UTC is ', nowUTC); //output 2023-04-05T15:44:40.984Z (ISO format)
// console.log(typeof now);
// now = now.toUTCString();

console.log('MYDB env is ', process.env.DATABASE_LOCAL);

const DBstring =
  process.env.NODE_ENV === 'development'
    ? process.env.DATABASE_LOCAL
    : process.env.DATABASE_DEPLOY;

mongoose
  .connect(DBstring, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('DB is connected successfuly!');

    //for testing and saving email creditsssssss
    //if no user create confirmed user
    // await User.deleteMany();
    const anyuser = await User.find();
    // console.log(anyuser);
    let user1;
    let user2;
    if (anyuser.length === 0) {
      user1 = await test.createTestUser();
      user2 = await test.createTestUser2();
    }
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

    // const testBooking = new Booking({
    //   name: { firstName: 'lol', lastName: 'attendeelastname' },
    //   gender: 'Male',
    //   phoneNumber: 12345678910,
    //   guestEmail: 'irushbullet@google.com',
    //   price: 100,
    //   quantity: 2,
    //   purchasedOn: Date.now(),
    // });
    // await testEvent2.save();
    // await testEvent.save().then(async () => {
    //   testTickets.eventID = testEvent._id;
    //   await testTickets.save().then(() => {
    //     testBooking.ticketID = testTickets._id;
    //     testBooking.save();
    //   });
    // });
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
app.listen(process.env.PORT, () => {
  console.log(`App is running on port ${process.env.PORT}`);
});
