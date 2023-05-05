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

//Database connection

const DBstring =
  process.env.NODE_ENV === 'development'
    ? process.env.DATABASE_LOCAL
    : process.env.DATABASE_DEPLOY;

const DBcheck =
  process.env.NODE_ENV === 'development' ? 'LOCAL DB' : 'DEPLOYED DB';
console.log('connecting to ', DBcheck);

// Seeder.Seed(DBstring);

mongoose
  .connect(DBstring, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log('DB is connected successfuly!');
  });

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
