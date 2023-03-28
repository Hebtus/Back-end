const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');
const test = require('./__test__/testutils/createConfirmedUser');
//Load config
dotenv.config({ path: '.config.env' });
const Seeder = require('./seeds/seeder');

const User = require('./models/userModel');
const Event = require('./models/eventModel');
const Tickets = require('./models/ticketModel');
const Booking = require('./models/bookingModel');

//Database connection
console.log('MYDB env is ', process.env.DATABASE_LOCAL);

const DBstring =
  process.env.NODE_ENV === 'development'
    ? process.env.DATABASE_LOCAL
    : process.env.DATABASE;

mongoose
  .connect(DBstring, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('DB is connected successfuly!');

    //for testing and saving email creditsssssss
    //if no user create confirmed user
    const anyuser = await User.find();
    // console.log(anyuser);
    // if (anyuser.length === 0) test.createTestUser();
    // if (anyuser.length === 0) {
    //   Seeder.Seed();
    // }
    await mongoose.connection.db.dropDatabase();

    // console.log('DB is removed successfuly!');
    //Schema Testing
    const testEvent = new Event({
      name: 'loleventxd',
      startDate: Date.now(),
      endtDate: Date.now() + 1000 * 60 * 60 * 24 * 10, //after 10 days
      privacy: false,
      category: 'Music',
    });

    const testEvent2 = new Event({
      name: 'lolevent2xd',
      startDate: Date.now(),
      endtDate: Date.now() + 1000 * 60 * 60 * 24 * 10, //after 10 days
      privacy: false,
      category: 'Music',
    });

    const testEvent3 = new Event({
      name: 'lolevent3xd',
      startDate: Date.now(),
      endtDate: Date.now() + 1000 * 60 * 60 * 24 * 10, //after 10 days
      privacy: false,
      category: 'Food & Drink',
    });

    const testTickets = new Tickets({
      name: '2a3det 4ayTicket',
      type: 'Regular',
      price: 100,
      capacity: 10,
      sellingStartTime: Date.now() + 1000 * 60 * 60 * 24 * 1,
      sellingEndTime: Date.now() + 1000 * 60 * 60 * 24 * 2,
    });

    const testBooking = new Booking({
      name: { firstName: 'lol', lastName: 'attendeelastname' },
      gender: 'Male',
      phoneNumber: 12345678910,
      guestEmail: 'irushbullet@google.com',
      price: 100,
      quantity: 2,
      purchasedOn: Date.now() + 1000 * 60 * 60 * 24 * 1,
    });
    await testEvent.save().then(async () => {
      testTickets.eventID = testEvent._id;
      await testTickets.save().then(() => {
        testBooking.ticketID = testTickets._id;
        testBooking.save();
      });
    });
    await testEvent2.save();
    await testEvent3.save();
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
