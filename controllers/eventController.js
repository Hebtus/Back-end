const { promisify } = require('util');

const catchAsync = require('../utils/catchAsync');

exports.getEvents = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama Mooooot ya google',
  });
});

// exports.resetPassword = catchAsync(async (req, res, next) => {
//   res.status('200').json({
//     status: 'success',
//     message: '3azama',
//   });
// });

exports.createEvent = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama bas m4 google',
  });
});

exports.getEvent = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama bas m4 google',
  });
});

exports.editEvent = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama bas m4 google',
  });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama bas m4 google',
  });
});

exports.getEventSales = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama bas m4 google',
  });
});
