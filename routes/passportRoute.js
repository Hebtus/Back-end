/** Express router providing user related routes
 * @module Routers/passportRouter
 * @requires express
 */
const AppError = require('../utils/appError');
const dotenv = require('dotenv');
const express = require('express');
const passport = require('passport');
const goolgePassportAuth = require('../passport/googlepassportAuth');
const facebookPassportAuth = require('../passport/facebookpassportAuth');
const { OAuth2Client } = require('google-auth-library');
//check that this works
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const User = require('../models/userModel');
const authenticationController = require('../controllers/authenticationController');
const catchAsync = require('../utils/catchAsync');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

dotenv.config({ path: './config.env' });
goolgePassportAuth.googleAuth(passport);
facebookPassportAuth.facebookAuth(passport);
/**
 * Express router to mount user related functions on.
 * @type {object}
 * @const
 * @namespace PassportRouter
 */
const router = express.Router();

//Passport middleware
router.use(passport.initialize());
// app.use(passport.session());router.get('/login/facebook', passport.authenticate('facebook'));

/**
 * Route serving Front End facebook authentication.
 * @name get/login/facebook
 * @function
 * @memberof module:Routers/passportRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get(
  '/login/facebook',
  passport.authenticate('facebook', { session: false })
);

router.get(
  '/login/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login/facebook',
    scope: ['profile', 'email'],
    session: false,
  }),
  catchAsync(async (req, res, next) => {
    //can get req.user here
    authenticationController.createToken(req.user, res);

    const tempjwttoken = res.token;
    // https://hebtus.me/google-facebook-token/{token}
    res.redirect(
      `${process.env.FRONTEND_URL}/google-facebook-token/${tempjwttoken}`
    );
    // res.redirect(`${process.env.FRONTEND_URL}/login`);
  })
);

/**
 * Route serving Front End google authentication.
 * @name get/login/google
 * @function
 * @memberof module:Routers/passportRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.get(
  '/login/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/login/google/callback',
  passport.authenticate('google', { failureRedirect: '/', session: false }),
  catchAsync(async (req, res, next) => {
    //can get req.user here
    authenticationController.createToken(req.user, res);

    const tempjwttoken = res.token;
    // https://hebtus.me/google-facebook-token/{token}
    res.redirect(
      `${process.env.FRONTEND_URL}/google-facebook-token/${tempjwttoken}`
    );
    // res.redirect(`${process.env.FRONTEND_URL}/login`);
  })
);

//for cross
/**
 * @function
 * @description - Called by Cross Platform to authenticate google sign in and sign up
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @param {object} next -The next object for express middleware
 * @returns {object} - Returns the response object
 */
const AuthenticateGoogle = catchAsync(async (req, res, next) => {
  console.log('accessed google auth post route');
  if (!req.body.tokenId) {
    console.log('You must provide Google tokenId');
    return res.status(400).send('You must provide Google tokenId');
  }
  const token = req.body.tokenId;
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGEL_CLIENT_ID,
  });
  const { name, email } = ticket.getPayload();
  console.log(ticket.getPayload());
  var user = await User.findOne({ email: email });
  if (!user) {
    user = new User({
      name: {
        firstName: name.split(' ')[0],
        lastName: name.split(' ')[1],
      },
      email: email,
      GoogleID: token,
      password: Math.random().toString().substr(2, 10),
      accountConfirmation: 1,
    });
    await user.save();
  }
  authenticationController.createSendToken(user, 201, res);
});

/**
 * Route serving Cross Platform google authentication.
 * @name post/login/google
 * @function
 * @memberof module:Routers/passportRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post('/login/google', AuthenticateGoogle);

/**
 * Route serving Cross Platform facebook authentication.
 * @name post/login/facebook
 * @function
 * @memberof module:Routers/passportRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post(
  '/login/facebook',
  catchAsync(async (req, res, next) => {
    if (!req.body.idToken || !req.body.accessToken)
      return res.status(400).send('request body lacks idToken or accessToken');
    if (!req.body.email)
      return res.status(400).send('request body lacks email');

    const facebookVerifyresponse = await fetch(
      `https://graph.facebook.com/debug token?input_token=${req.body.idToken}&access_token=${req.body.accessToken}`
    );
    if (facebookVerifyresponse.error)
      return res.status(400).send('invalid facebook token');

    if (facebookVerifyresponse.is_valid === false)
      return res.status(400).send('invalid facebook token');

    var user = await User.findOne({ email: req.body.email });
    if (!user) {
      user = new User({
        name: req.body.name,
        email: req.body.email,
        password: Math.random().toString().substr(2, 10),
        accountConfirmation: 1,
      });
      await user.save();
    }

    authenticationController.createSendToken(user, 201, res);
  })
);

//for Web FE

const decodeJWT = async (req, res, next) => {
  const token = req.params.token;
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  ).catch((error) => {
    next(new AppError('Could not decode token.', 401));
    // Handle the error.
  });
  // })(token, process.env.JWT_SECRET);
  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }
  //we'll see if we add changed pass after or just use changed at and compare hashoof kda
  // GRANT ACCESS TO PROTECTED ROUTE
  // req.user = currentUser;
  return currentUser;
};

/**
 * Route serving Front End's Redirect Page.
 * @name post/login/googlefacebookverify/:token
 * @function
 * @memberof module:Routers/passportRouter
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware.
 */
router.post(
  '/login/googlefacebookverify/:token',
  catchAsync(async (req, res, next) => {
    const user = await decodeJWT(req, res, next);

    console.log('user', user);

    authenticationController.createSendToken(user, 200, res);
  })
);

module.exports = router;
