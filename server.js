const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

dotenv.config({ path: './config.env' });
const User = require('./models/userModel');

//Database connection
console.log('MYDB env is ', process.env.DATABASE_LOCAL);
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB is connected successfuly!');
  });

// const testUser = new User({
//   name: {
//     firstName: 'loler',
//     lastName: 'Ameer',
//   },
//   email: 'lol@lol.com',
//   location: { coordinates: [-91, -45] },
//   password: 'lolerrrr',
// });

// testUser
//   .save()
//   .then((doc) => {
//     console.log(doc);
//     console.log('Saved Successfully!!!!!!!');
//   })
//   .catch((err) => {
//     console.log(err);
//   });
//Hosting the server
app.listen(process.env.PORT, () => {
  console.log(`App is running on port ${process.env.PORT}`);
});
