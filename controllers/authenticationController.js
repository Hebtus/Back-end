// const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama',
  });
  // createSendToken(user, 200, res);
  //user shall be optained every time by the email or id provided then passed to the callback fucntion
});
exports.logout = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama',
  });
});
exports.confirmEmail = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama',
  });
});
exports.facebookLogin = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama',
  });
});
exports.googleLogin = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama',
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama',
  });
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama',
  });
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new AppError('confirm password doesnt match', 401));
  }
  user.password = req.body.password;

  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
