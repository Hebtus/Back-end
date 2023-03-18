const dotenv = require('dotenv');
const mongoose = require('mongoose');
const passport = require('passport');
// eslint-disable-next-line import/no-extraneous-dependencies
const session = require('express-session');
const app = require('./app');

//Load config
dotenv.config({ path: './utils/config/config.env' });

//Passport config
require('./utils/config/passport')(passport);

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
  .then(() => {
    console.log('DB is connected successfuly!');

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
//     password: 'lolerrrr',
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
