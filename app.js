const dotenv = require('dotenv');
const passport = require('passport');
const express = require('express');

const session = require('express-session');
const authenticationRouter = require('./routes/authenticationRoute');
const eventRouter = require('./routes/eventRoute');
const googleCallback = require('./routes/googleCallback');
// const cookieParser = require('cookie-parser');

dotenv.config({ path: './config.env' });
// Passport config
// require('./config/passport')(passport);
const passportAuth = require('./passport/passportAuth');

passportAuth.GoogleAuth(passport);
const app = express();

app.use(express.json());

// Sessions;
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  })
);

//Passport middleware
app.use(passport.initialize());
// app.use(passport.session());

// app.use(cookieParser());

app.use('/api/v1', authenticationRouter);
// app.use('/api/v1/events', eventRouter);
// app.use('/login/google/callback', googleCallback);
// app.use('/', viewRouter);
// app.use('/api/v1/tours', tourRouter);
// app.use('/api/v1/users', userRouter);
// app.use('/api/v1/reviews', reviewRouter);
// app.use('/api/v1/bookings', bookingRouter);

module.exports = app;
