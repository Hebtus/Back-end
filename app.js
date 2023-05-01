const dotenv = require('dotenv');
// const passport = require('passport');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authenticationRouter = require('./routes/authenticationRoute');
const eventRouter = require('./routes/eventRoute');
const creatorRouter = require('./routes/creatorRoute');
const passportRouter = require('./routes/passportRoute');
const bookingRouter = require('./routes/bookingRoute');
const promoCodeRouter = require('./routes/promoCodeRoute');
const notificationRouter = require('./routes/notificationRoute');
const ticketRouter = require('./routes/ticketRoute');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const cookieParser = require('cookie-parser');

dotenv.config({ path: './config.env' });
const app = express();
app.enable('trust proxy');

app.use(cors());
app.use(helmet());

app.use(express.json());
app.use(cookieParser());

// app.use('/api/v1/lol', async (req, res, next) => {
//   try {
//     await test.createTestUser();
//   } catch (err) {
//     // res.status(500).json({
//     //   status: 'error',
//     //   message: err.message,
//     // });
//     console.log(err);
//     next(err);
//   }
// });
app.use('/api/v1', (req, res, next) => {
  console.log('hello from Major App Middleware');
  next();
});
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/oauth', passportRouter);
app.use('/api/v1/tickets', ticketRouter);
app.use('/api/v1/creators/events', creatorRouter);
app.use('/api/v1/bookings', bookingRouter); //TODO: base route to be discussed later
app.use('/api/v1/promocodes', promoCodeRouter);
app.use('/api/v1', authenticationRouter);
app.use('/api/v1/notifications', notificationRouter);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
