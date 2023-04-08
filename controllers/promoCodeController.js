const multer = require('multer');
const Event = require('../models/eventModel');
const Ticket = require('../models/ticketModel');
const promoCode = require('../models/promoCodeModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//for reading csv file
// const csv = require('csv-parser');
const { Readable } = require('stream');
const { parse } = require('fast-csv');

const multerTempStorage = multer.memoryStorage();
//Limit the file size to 5MB
const multerLimits = { filesize: 5 * 10 ** 6, fields: 0, files: 1 };

// Filters the type of files that this request accepts
// const multerFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith('image')) {
//     cb(null, true);
//   } else {
//     cb(new AppError('Not an image! Please upload only images.', 400), false);
//   }
// };

const csvFilter = (_req, file, cb) => {
  // console.log('Reading file in middleware', file.originalname);
  if (file === undefined) {
    cb('Please upload a file first to proceed.', false);
  } else if (file.mimetype.includes('csv')) {
    cb(null, true);
  } else {
    cb('Please upload only CSV file type.', false);
  }
};

exports.uploadCSV = multer({
  storage: multerTempStorage,
  fileFilter: csvFilter,
  limits: multerLimits,
});

exports.createPromoCode = catchAsync(async (req, res, next) => {
  //first check that the user is the creator of the event that the ticket is associated with

  let ticket;
  try {
    ticket = await Ticket.findOne({ _id: req.params.id });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: 'No ticket found with this id ',
    });
  }

  if (!ticket) {
    return res.status(400).json({
      status: 'fail',
      message: 'No ticket found with this id ',
    });
  }

  const event = await Event.findOne({ _id: ticket.eventID });
  if (!event.creatorID.equals(req.user._id)) {
    return res.status(404).json({
      status: 'fail',
      message: 'You cannot access events that are not yours ',
    });
  }

  if (
    !req.body.codeName ||
    !req.body.discountOrPercentage ||
    !req.body.limits
  ) {
    return res.status(400).json({
      status: 'fail',
      message:
        'Promocode codeName, discountOrPercentage and limits are required',
    });
  }

  if (req.body.discountOrPercentage === 1) {
    //discount
    if (!req.body.discount) {
      return res.status(400).json({
        status: 'fail',
        message: 'Discount is required in case of discountorPercentage = 1',
      });
    }
    //check that the discount is not greater than the ticket price
    if (req.body.discount > ticket.price) {
      return res.status(400).json({
        status: 'fail',
        message: 'Discount cannot be greater than the ticket price ',
      });
    }
    await promoCode.create({
      codeName: req.body.codeName,
      limits: req.body.limits,
      discountAmount: req.body.discount,
      discountOrPercentage: 1,
      ticketID: req.params.id,
    });
  } else {
    //percentage
    if (!req.body.percentage) {
      return res.status(400).json({
        status: 'fail',
        message: 'Percentage is required in case of discountorPercentage = 0',
      });
    }

    console.log('perc is', req.body);
    // console.log('perc is', req.body.percentage);
    await promoCode.create({
      codeName: req.body.codeName,
      limits: req.body.limits,
      percentage: req.body.percentage,
      discountOrPercentage: 0,
      ticketID: req.params.id,
    });
  }

  res.status(200).json({
    status: 'success',
    message: 'PromoCode created Successfully.',
  });
});

exports.createPromoCodeCSV = catchAsync(async (req, res, next) => {
  //first check that the user is the creator of the event that the ticket is associated with
  let ticket;
  try {
    ticket = await Ticket.findOne({ _id: req.params.id });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: 'No ticket found with this id ',
    });
  }

  if (!ticket) {
    return res.status(400).json({
      status: 'fail',
      message: 'No ticket found with this id ',
    });
  }

  const event = await Event.findOne({ _id: ticket.eventID });
  if (!event.creatorID.equals(req.user._id)) {
    return res.status(404).json({
      status: 'fail',
      message: 'You cannot access events that are not yours ',
    });
  }

  if (req.file === undefined) {
    return res.status(400).send('Please upload a CSV file!');
  }
  const csvfile = req.file;
  const stream = Readable.from(csvfile.buffer);

  // stream.pipe(csv()).on('data', async (row) => {
  //   console.log(row);
  // });
  stream.pipe(parse({ headers: true })).on('data', async (row) => {
    console.log(row);
  });

  res.status(200).json({
    status: 'success',
    message: 'PromoCode created Successfully.',
  });
});
