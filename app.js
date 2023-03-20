const express = require('express');
const passport = require('passport');
const authenticationRouter = require('./routes/authenticationRoute');
const googleCallback = require('./routes/googleCallback');
// const cookieParser = require('cookie-parser');

const app = express();

// app.use(cookieParser());

app.use(express.json());
app.use('/api/v1', authenticationRouter);
app.use('/login/google/callback', googleCallback);
// app.use('/api/v1/events', authenticationRouter);
// app.use('/', viewRouter);
// app.use('/api/v1/tours', tourRouter);
// app.use('/api/v1/users', userRouter);
// app.use('/api/v1/reviews', reviewRouter);
// app.use('/api/v1/bookings', bookingRouter);

module.exports = app;
