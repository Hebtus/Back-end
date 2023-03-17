const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

dotenv.config({ path: './config.env' });
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
  });
const testUser = new User({
  name: {
    firstName: 'loler',
    lastName: 'Ameer',
  },
  email: 'lol@lol.com',
  location: { type: 'lol', coordinates: [-91.32, 1.32] },
  password: 'lolerrrr',
  //   passwordChangedAt: '1987-09-28 20:01:07',
});

testUser
  .save()
  .then((doc) => {
    console.log(doc);
    console.log('Saved Successfully!!!!!!!');
  })
  .catch((err) => {
    console.log(err);
  });

//Hosting the server
app.listen(process.env.PORT, () => {
  console.log(`App is running on port ${process.env.PORT}`);
});
