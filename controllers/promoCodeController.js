/* eslint-disable no-restricted-syntax */
const multer = require('multer');
const Event = require('../models/eventModel');
const Ticket = require('../models/ticketModel');
const promoCode = require('../models/promoCodeModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * The Controller responsible for handling requests relating to promocodes
 * @module Controllers/promoCodeController
 */

//for reading csv file
// const csv = require('csv-parser');
const { Readable } = require('stream');
const { parse } = require('fast-csv');

const multerTempStorage = multer.memoryStorage();
//Limit the file size to 5MB
const multerLimits = { filesize: 5 * 10 ** 6, fields: 0, files: 1 };

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
/**
 * @function
 * @description - Called by creator to create promocodes.
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @param {object} next -The next object for express middleware
 * @returns {object} - Returns the response object
 */
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

/**
 * @function
 * @description - Parses CSV file and returns the data and headers
 * @param {object} readable -The readable stream object
 * @param {object} csvData -The csv data object
 * @param {object} csvHeaders -The csv headers object
 * @returns {object} - Returns the csv data and headers
 */
async function parseCSV(readable, csvData, csvHeaders) {
  let counter = 1;
  for await (const chunk of readable) {
    line = chunk.split('\n');

    for await (const data of line) {
      if (counter === 1) {
        csvHeaders = data.split(',');
      } else {
        if (data === '') {
          continue;
        }
        csvData.push(data.split(','));
      }
      counter += 1;
    }
  }
  return { csvData, csvHeaders };
}

/**
 * @function
 * @description - Called by creator to export his promocodes and create them in the form of CSV.
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @param {object} next -The next object for express middleware
 * @returns {object} - Returns the response object
 */
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
  //8aleban 4eel kol response w 7ot makano AppError
  let promoCodes = [];
  let errorflag = 0;

  stream.setEncoding('utf8');
  // stream.
  let csvHeaders = [];
  let csvData = [];
  let parsed = await parseCSV(stream, csvHeaders, csvData);
  csvHeaders = parsed.csvHeaders;
  csvData = parsed.csvData;

  console.log('csvHeaders is', csvHeaders);
  console.log('csvData is', csvData);

  //assumed format
  //codeName discountOrPercentage discount/percentage limits
  // eslint-disable-next-line node/no-unsupported-features/es-syntax
  for await (const data of csvData) {
    const csvCodeName = data[0];
    const csvDiscountOrPercentage = data[1];
    const csvLimits = data[3];
    if (csvDiscountOrPercentage === 1) {
      const csvDiscount = data[2];
      await promoCode.create({
        codeName: csvCodeName,
        limits: csvLimits,
        discountAmount: csvDiscount,
        discountOrPercentage: csvDiscountOrPercentage,
        ticketID: req.params.id,
      });
    } else {
      const csvPercentage = data[2];
      await promoCode.create({
        codeName: csvCodeName,
        limits: csvLimits,
        percentage: csvPercentage,
        discountOrPercentage: 0,
        ticketID: req.params.id,
      });
    }
  }
  //#region
  // await stream
  //   .pipe(parse({ headers: true }))
  //   .on('data', async (promoCoderow) => {
  //     console.log('row is ', promoCoderow);
  //     promoCodes += promoCoderow;
  //start applying promoCode logic here including validation and etc
  // if (
  //   !promoCoderow.codeName ||
  //   !promoCoderow.discountOrPercentage ||
  //   !promoCoderow.limits
  // ) {
  //   console.log('bsra7a lol gedannn');
  //   // res.status(400).json({
  //   //   status: 'fail',
  //   //   message:
  //   //     'Promocode codeName, discountOrPercentage and limits are required',
  //   // });
  //   // stream.destroy(
  //   //   'Promocode codeName, discountOrPercentage and limits are required'
  //   // );
  //   // stream.destroy(
  //   //   new AppError(
  //   //     'Promocode codeName, discountOrPercentage and limits are required',
  //   //     400
  //   //   )
  //   // );
  //   // return new AppError(
  //   //   'Promocode codeName, discountOrPercentage and limits are required',
  //   //   400
  //   // );
  // }

  // if (promoCoderow.discountOrPercentage === 1) {
  //   //   //discount
  //   //   if (!req.body.discount) {
  //   //     return res.status(400).json({
  //   //       status: 'fail',
  //   //       message: 'Discount is required in case of discountorPercentage = 1',
  //   //     });
  //   //   }
  //   //   //check that the discount is not greater than the ticket price
  //   //   // if (promoCoderow.discount > ticket.price) {
  //   //   //   return res.status(400).json({
  //   //   //     status: 'fail',
  //   //   //     message: 'Discount cannot be greater than the ticket price ',
  //   //   //   });
  //   //   }
  //   await promoCode
  //     .create({
  //       codeName: promoCoderow.codeName,
  //       limits: promoCoderow.limits,
  //       discountAmount: promoCoderow.discount,
  //       discountOrPercentage: 1,
  //       ticketID: req.params.id,
  //     })
  //     .catch((err) => {
  //       return next(err);
  //     });
  // } else {
  //   //percentage
  //   // if (!promoCoderow.percentage) {
  //   //   return res.status(400).json({
  //   //     status: 'fail',
  //   //     message:
  //   //       'Percentage is required in case of discountorPercentage = 0',
  //   //   });
  //   console.log('perc is', req.body);
  //   // console.log('perc is', req.body.percentage);
  //   await promoCode
  //     .create({
  //       codeName: promoCoderow.codeName,
  //       limits: promoCoderow.limits,
  //       percentage: promoCoderow.percentage,
  //       discountOrPercentage: 0,
  //       ticketID: req.params.id,
  //     })
  //     .catch((err) => {
  //       return next(err);
  //     });
  // }
  //   })
  //   .on('error', (err) => {
  //     // return next(err);
  //     console.log('entered here bardo w bamassy');
  //     errorflag = 1;
  //   });
  // console.log('promoCodes is', promoCodes);
  // for (const pc of promoCodes) {
  //   console.log(pc);
  // }
  // promoCodes.for((pc) => {
  //   console.log(pc);
  // });

  // if (errorflag === 1) {
  //   console.log('Entered here w bamassy');
  //   return new AppError('Error in CSV file', 400);
  // }

  //endregion

  // console.log('promoCodes is', promoCodes);
  res.status(200).json({
    status: 'success',
    message: 'PromoCode created Successfully.',
  });
});
