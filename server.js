const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');
const test = require('./__test__/testutils/createConfirmedUser');
//Load config
dotenv.config({ path: '.config.env' });

const User = require('./models/userModel');

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
    if (anyuser.length === 0) test.createTestUser();
    // mongoose.connection.db.dropDatabase();

    // console.log('DB is removed successfuly!');
  });

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
