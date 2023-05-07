/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable no-continue */
/* eslint-disable vars-on-top */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-restricted-syntax */
const multer = require('multer');
// const { parse } = require('fast-csv');
const { Readable } = require('stream');
const Event = require('../models/eventModel');
const PromoCode = require('../models/promoCodeModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * The Controller responsible for handling requests relating to promocodes
 * @module Controllers/promoCodeController
 */

//for reading csv file
// const csv = require('csv-parser');

const multerTempStorage = multer.memoryStorage();
//Limit the file size to 5MB
const multerLimits = { filesize: 5 * 10 ** 6, fields: 1, files: 1 }; // 1 field (eventID)and 1 file

const csvFilter = (_req, file, cb) => {
  // console.log('Reading file in middleware', file.originalname);
  if (file === undefined) {
    cb('Please upload a file first to proceed.', false);
  } else if (
    file.mimetype.includes('csv') ||
    file.mimetype === 'application/octet-stream' //for cross platform compatibility
  ) {
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

  let event;
  try {
    event = await Event.findOne({ _id: req.body.eventID });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: 'No event found with this id ',
    });
  }

  if (!event) {
    return res.status(400).json({
      status: 'fail',
      message: 'No event found with this id ',
    });
  }

  if (!event.creatorID.equals(req.user._id)) {
    return res.status(404).json({
      status: 'fail',
      message: 'You cannot access events that are not yours ',
    });
  }

  await PromoCode.create(req.body);

  res.status(200).json({
    status: 'success',
    message: 'PromoCode created Successfully.',
  });
});

/**
 * @function
 * @description - Parses CSV file and returns the data and headers
 * @param {object} readable -The readable stream object
 * @returns {object} - Returns the csv data and headers
 */
async function parseCSV(readable) {
  let counter = 1;
  let csvHeaders = [];
  const csvData = [];
  for await (const chunk of readable) {
    const line = chunk.split('\n');

    for await (const data of line) {
      if (counter === 1) {
        csvHeaders = data.split(',');
        //remove the carriage return from the last header
        csvHeaders[csvHeaders.length - 1] = csvHeaders[
          csvHeaders.length - 1
        ].replace('\r', '');
      } else {
        if (data === '') {
          continue;
        }
        csvData.push(data.split(','));
        //remove the carriage return from the last entry
        csvData[csvData.length - 1][csvData[csvData.length - 1].length - 1] =
          csvData[csvData.length - 1][
            csvData[csvData.length - 1].length - 1
          ].replace('\r', '');
      }
      counter += 1;
    }
  }
  return { csvData, csvHeaders };
}

/**
 * @function
 * @description - Takes the CSV data and headers and then returns an array of promoCode objects. It assumes that both are aligned well.
 * @param {object} csvData -The csv data object
 * @param {object} csvHeaders -The csv headers object
 * @param {object} eventID -The ID of the event addressed
 * @returns {object} - Returns the csv data and headers
 */

const makePromoCodeObjects = async (csvData, csvHeaders, eventID) => {
  const promoCodes = [];
  for (const data of csvData) {
    const promoCode = {};
    for (let i = 0; i < data.length; i++) {
      promoCode[csvHeaders[i]] = data[i];
    }
    promoCode.eventID = eventID;
    promoCodes.push(promoCode);
  }
  return promoCodes;
};

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
  console.log('Recieved Request on CreatePromocodeCSV');

  let event;
  try {
    event = await Event.findOne({ _id: req.body.eventID });
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      message: 'No event found with this id ',
    });
  }

  if (!event.creatorID.equals(req.user._id)) {
    return res.status(401).json({
      status: 'fail',
      message: 'You cannot access events that are not yours ',
    });
  }

  if (req.file === undefined) {
    return res.status(400).send('Please upload a CSV file!');
  }
  const csvfile = req.file;
  const stream = Readable.from(csvfile.buffer);

  stream.setEncoding('utf8');
  const parsed = await parseCSV(stream);
  console.log(parsed);

  const { csvHeaders, csvData } = parsed;

  console.log(csvHeaders, csvData);
  //no need to check csv formatting, any ouster pieces of data will automatically cause a validation error
  const promocodeObjects = await makePromoCodeObjects(
    csvData,
    csvHeaders,
    req.body.eventID
  );

  const createdPromocodesIDs = [];
  let createdPromocode;
  for (const promoCode of promocodeObjects) {
    try {
      createdPromocode = await PromoCode.create(promoCode);
    } catch (err) {
      await PromoCode.deleteMany({ _id: { $in: createdPromocodesIDs } });

      console.log(err);
      return res.status(400).json({
        status: 'fail',
        message: 'Error creating promocodes',
      });
    }

    createdPromocodesIDs.push(createdPromocode._id);
    if (res.headersSent) return;
  }

  res.status(200).json({
    status: 'success',
    message: 'PromoCodes created Successfully.',
  });
});

/**
 * @function
 * @description - Called by creator to get a certain event's promocodes with pagination and limit
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @param {object} next -The next object for express middleware
 * @returns {object} - Returns the response object
 */
exports.getEventPromocodes = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;
  const eventId = req.params.id;
  const event = await Event.findOne({ _id: eventId });
  if (!event) {
    return res.status(404).json({
      status: 'fail',
      message: 'No event found with this id ',
    });
  } else if (!event.creatorID.equals(req.user._id)) {
    return res.status(401).json({
      status: 'fail',
      message: 'You cannot access events that are not yours ',
    });
  }
  const promocodes = await PromoCode.find({ eventID: eventId })
    .skip(skip)
    .limit(limit);

  return res.status(200).json({
    status: 'success',
    data: {
      promocodes,
    },
  });
});
