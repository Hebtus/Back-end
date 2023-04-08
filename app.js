const dotenv = require('dotenv');
// const passport = require('passport');
const express = require('express');

const authenticationRouter = require('./routes/authenticationRoute');
const eventRouter = require('./routes/eventRoute');
const creatorRouter = require('./routes/creatorRoute');
const passportRouter = require('./routes/passportRoute');
// const cookieParser = require('cookie-parser');

dotenv.config({ path: './config.env' });

const app = express();

app.use(express.json());

// app.use(cookieParser());

app.use('/api/v1', authenticationRouter);
app.use('/api/v1/oauth', passportRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/tickets', ticketRouter);
app.use('/api/v1/creators/events', creatorRouter);

// app.use('/login/google/callback', googleCallback);
// app.use('/', viewRouter);
// app.use('/api/v1/tours', tourRouter);
// app.use('/api/v1/users', userRouter);
// app.use('/api/v1/reviews', reviewRouter);
// app.use('/api/v1/bookings', bookingRouter);

module.exports = app;
