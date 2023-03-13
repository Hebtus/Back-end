// const crypto = require('crypto');
// const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama',
  });
});

exports.login = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama',
  });
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
