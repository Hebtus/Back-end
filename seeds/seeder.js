const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const { faker } = require('@faker-js/faker');
const userSeeds = require('./data/userSeeds');
const User = require('../models/userModel');

module.exports = async function Seed() {
  console.log('loool');
  //Database connection
  mongoose
    .connect(process.env.DATABASE_LOCAL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('DB is connected successfuly!');
    });

  const userObjects = userSeeds();
  const users = await User.create(userObjects, { validateBeforeSave: false });

  console.log('Seeds executed successfully');
};
