/* eslint-disable no-plusplus */
const multer = require('multer');
//const fs = require('fs');
const crypto = require('crypto');
const streamifier = require('streamifier');
const Event = require('../models/eventModel');
const Ticket = require('../models/ticketModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const cloudinary = require('../utils/cloudinary');

/**
 * The Controller responsible for handling authentication Requests
 * @module Controllers/eventController
 */

/**
 * @function
 * @description - Makes all private events public if the goPublicDate is passed
 */
exports.makeprivateEventsPublic = async () => {
  const privateEvents = await Event.updateMany(
    { privacy: true, goPublicDate: { $lte: Date.now() } },
    { privacy: false }
  );
};

//Multer
const multerTempStorage = multer.memoryStorage();

const multerFilter = (req, file, callback) => {
  if (
    file.mimetype.startsWith('image') ||
    file.mimetype === 'application/octet-stream' //for cross platform compatibility
  ) {
    callback(null, true);
  } else {
    callback(
      new AppError('Not an image please upload only images', 400),
      false
    );
  }
};
const upload = multer({
  storage: multerTempStorage,
  fileFilter: multerFilter,
});
exports.uploadEventPhoto = upload.single('image');
/////////////////////////////////////////////////////

/**
 * @function
 * @description - Called by client to get all events in the main page or filter them according to Category and Time. The function also handles pagination and geoquery.
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @param {object} next -The next object for express middleware
 * @returns {object} - Returns the response object
 */
exports.getEvents = catchAsync(async (req, res, next) => {
  await exports.makeprivateEventsPublic();
  //check on mongoose behaviour with non existent parameters
  // if parameters don't exist mongoose returns nothing
  // ie. no need for checks
  const Filter = {
    creatorID: 0,
    ticketsSold: 0,
    password: 0,
    draft: 0,
    goPublicDate: 0,
  };
  //Pagination Setup
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  //Geoquery setup
  let longitude;
  let latitude;
  if (req.query.location) {
    const locationValues = req.query.location.split(',');
    longitude = locationValues[0] * 1; //times 1 to convert them into numbers
    latitude = locationValues[1] * 1;
  } else {
    longitude = 31.2107164;
    latitude = 30.0246686;
  }
  let goQuery = 1;
  let eventsData = [];
  if (req.query.category && goQuery) {
    eventsData = await Event.find({
      category: req.query.category,
      privacy: 0,
      draft: 0,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: 50 * 1000, //assume 50 km radius
        },
      },
    })
      .select(Filter)
      .skip(skip)
      .limit(limit)
      .sort({ endDate: -1 });
    goQuery = false;
  }

  if (req.query.startDate && req.query.endDate && goQuery) {
    // The query works fine with both ISO format and UTC format
    // Other timezones and formats are not checked.
    // console.log('start date is ', req.query.startDate);
    // console.log('end date is ', req.query.endDate);
    eventsData = await Event.find({
      $or: [
        //
        { startDate: { $gte: req.query.startDate, $lte: req.query.endDate } },
        { endDate: { $gte: req.query.startDate, $lte: req.query.endDate } },
        {
          //query lies within event limits of time
          startDate: { $lte: req.query.startDate },
          endDate: { $gte: req.query.endDate },
        },
      ],
      privacy: false,
      draft: false,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: 50 * 1000, //assume 50 km radius
        },
      },
    })
      .select(Filter)
      .skip(skip)
      .limit(limit)
      .sort({ endDate: -1 });

    goQuery = false;
  }

  if (req.query.free && goQuery) {
    eventsData = await Event.aggregate([
      //////pipeline stages//////
      //geoNear must be the first stage
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [longitude, latitude] },
          includeLocs: 'location',
          maxDistance: 50 * 1000, //assume 50 km radius
          distanceField: 'distance',
          spherical: true,
          // geometry: { type: 'Point', coordinates: [longitude, latitude] },
        },
      },
      //match event by rest of conditions
      {
        $match: {
          privacy: false,
          draft: false,
        },
      },
      //find tickets according to its condition on price and time period and add it to the event object
      {
        $lookup: {
          from: 'tickets',
          localField: '_id', //of the event
          foreignField: 'eventID', //of the ticket
          as: 'tickets',
          pipeline: [
            {
              $match: {
                price: 0,
                sellingStartTime: { $lte: new Date(Date.now()) }, //had to convert it to ISO form
                sellingEndTime: { $gte: new Date(Date.now()) }, //had to also convert it to ISO form
                $expr: {
                  $lt: ['$currentReservations', '$capacity'],
                },
              },
            },
          ],
        },
      },
      //match events that have tickets satisfying the above conditions
      {
        $match: {
          tickets: { $ne: [] },
        },
      },
      //project the fields we want
      {
        $project: {
          creatorID: 0,
          ticketsSold: 0,
          password: 0,
          draft: 0,
          goPublicDate: 0,
          tickets: 0,
        },
      },
    ])
      .skip(skip)
      .limit(limit);

    goQuery = false;
  }

  if (req.query.online && goQuery) {
    //online events are exempt from location restriction
    eventsData = await Event.find({ online: 1, privacy: 0, draft: 0 })
      .select(Filter)
      .skip(skip)
      .limit(limit)
      .sort({ endDate: -1 });
    goQuery = false;
  }

  //no parameter case
  if (goQuery) {
    eventsData = await Event.find({
      privacy: 0,
      draft: 0,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [longitude, latitude] },
          $maxDistance: 50 * 1000, //assume 50 km radius
        },
      },
    })
      .select(Filter)
      .skip(skip)
      .limit(limit)
      .sort({ endDate: -1 });
  }

  return res.status(200).json({
    status: 'success',
    data: { events: eventsData },
  });
});

/**
 * @function
 * @description -The Creator calls this function to create a new event by writing the basic info of the event and use cloudinary to upload the image of the event(if available) on the cloud and save the url of the image and the rest of the data in the db
 * @param {object} req -the request object
 * @param {object} res -the response object
 * @param {object} next -the next object for express middleware
 * @returns {object} -returns the res object
 */
exports.createEvent = catchAsync(async (req, res, next) => {
  console.log('reached create event route');
  const imageFile = req.file;
  // console.log('imageFile', imageFile);
  // console.log('req image', req.image);
  const {
    name,
    startDate,
    endDate,
    locationName,
    category,
    privacy,
    password,
    tags,
  } = req.body;
  const { location } = req.body;
  const locationCoordinates = location != null ? location.split(',') : null;
  const tagsArr = tags != null ? tags.split(',') : null;
  console.log('tags', tags);
  if (imageFile) {
    console.log('should upload image');
    const cloudUploadStream = cloudinary.uploader.upload_stream(
      { folder: 'events' },
      async (error, result) => {
        const createdEvent = await Event.create({
          name,
          privacy,
          password,
          category,
          creatorID: req.user.id,
          img_url: result.secure_url,
          startDate,
          endDate,
          locationName,
          tags: tagsArr,
          location: { coordinates: locationCoordinates },
        }).catch((err) => {
          console.log('lolxd');
          return res.status(400).json({
            status: 'fail',
            message: 'Could not Create Event',
          });
        });
        //if an error happned while uploading the image
        if (res.headersSent) return;
        res.status(200).json({
          status: 'success',
          data: {
            event: createdEvent,
          },
        });
      }
    );
    streamifier.createReadStream(imageFile.buffer).pipe(cloudUploadStream);
  } else {
    console.log('shouldnt  upload image');
    const createdEvent = await Event.create({
      name,
      privacy,
      password,
      category,
      creatorID: req.user.id,
      img_url: '',
      startDate,
      endDate,
      locationName,
      tags: tagsArr,
      location: { coordinates: locationCoordinates },
    }).catch((err) =>
      //Send error response if any error is encountered
      res.status(400).json({
        status: 'failed',
        message: err.message,
      })
    );
    //if an error happned while creating the event
    if (res.headersSent) return;
    return res.status(200).json({
      status: 'success',
      data: {
        event: createdEvent,
      },
    });
  }
});

exports.getEvent = catchAsync(async (req, res, next) => {
  //if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
  // Yes, it's a valid ObjectId, proceed with `findById` call.
  await exports.makeprivateEventsPublic();

  const event = await Event.findOne({ _id: req.params.id }).select({
    //Note : I did not put them in the pre find middleware because not all
    // find requests will deselect the same fields ex: get event by creator will retrieve all fields
    creatorID: 0,
    ticketsSold: 0,
    //password: 0,
    draft: 0,
    goPublicDate: 0,
  });
  if (!event) {
    return res.status(404).json({
      status: 'fail',
      message: 'No such event found with id',
    });
  }
  if (!event.privacy || (event.privacy && !event.password)) {
    // To delete privacy field
    const { privacy, password, ...eventWithoutPrivateData } = event.toObject();

    return res.status(200).json({
      status: 'success',
      data: eventWithoutPrivateData,
    });
  }
  return res.status(401).json({
    status: 'Unauthorized',
    message: 'You must enter the event password',
  });
});

exports.getEventwithPassword = catchAsync(async (req, res, next) => {
  const password = await crypto
    .createHash('sha256')
    .update(req.body.password)
    .digest('hex');
  //console.log(password);
  const event = await Event.findOne({ _id: req.params.id }).select({
    //Note : I did not put them in the pre find middleware because not all
    // find requests will deselect the same fields ex: get event by crearot will retrieve all fields
    creatorID: 0,
    ticketsSold: 0,
    privacy: 0,
    draft: 0,
    // password: 0,
    goPublicDate: 0,
  });
  if (event.password !== password) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid password',
    });
  }
  event.password = undefined;
  return res.status(200).json({
    status: 'success',
    data: event,
  });
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
/**
 * @description -this function allows the event creator only to edit his event and edit specific fileds only that are filtered by the filter utility function
 * @param {object} req -The request object
 * @param {object} res -The response object
 * @param {object} next -The next object for express middleware
 * @returns {object} -returns the response object
 */
exports.editEvent = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    'description',
    'tags',
    'privacy',
    'goPublicDate',
    'draft',
    'password'
  );
  console.log('filtered body', filteredBody);
  const updatedEvent = await Event.findById(req.params.id);
  if (!updatedEvent) {
    return res.status(404).json({
      status: 'fail',
      message: 'No event found with this id ',
    });
  }
  if (!updatedEvent.creatorID.equals(req.user._id)) {
    return res.status(404).json({
      status: 'fail',
      message: 'You cannot edit events that are not yours ',
    });
  }
  if (filteredBody.draft != null && filteredBody.draft === false) {
    const eventTicket = await Ticket.find({ eventID: req.params.id });
    if (eventTicket.length > 0) {
      updatedEvent.draft = false;
      console.log('trying to publish and undraft event');
    } else {
      return res.status(400).json({
        status: 'fail',
        message: 'You cannot publish an event if it has no tickets ',
      });
    }
  }
  //you can't set an event back to being unpublished
  if (updatedEvent.draft === false) filteredBody.draft = false;
  updatedEvent.set(filteredBody);
  await updatedEvent.save();

  //remove unnecessary fields
  updatedEvent._v = undefined;
  updatedEvent.password = undefined;

  // updatedEvent._id = undefined;
  return res.status(200).json({
    status: 'success',
    data: updatedEvent,
  });
});
/**
 * @function
 * @description -called to get the event sales through the booked tickets for each event and calculating the sales given the event id in parameters check the event existence and user authroity to check then existence of booked tickets
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @param {object} next -The next object for express middleware
 * @returns {object} - Returns the response object
 */
exports.getEventSales = catchAsync(async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;

  const event = await Event.findOne({
    _id: req.params.id,
    creatorID: req.user._id,
  });

  if (!event) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid event or creator',
    });
  }

  if (req.query.netsales) {
    const tickets = await Ticket.find({ eventID: req.params.id });

    const tickets2 = await Ticket.find({ eventID: req.params.id })
      .skip(skip)
      .limit(limit);

    if (!tickets.length) {
      return res.status(404).json({
        status: 'fail',
        message: 'No tickets found for this event',
      });
    }

    let total = 0;
    let salesByType = [];
    salesByType = tickets2;

    // Aggregate bookings data for each ticket
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      console.log(ticket._id);
      // eslint-disable-next-line no-await-in-loop
      const bookings = await Booking.find({
        ticketID: ticket._id,
      });

      if (bookings.length > 0) {
        let subtotal = 0;

        // Calculate the total sales and seats sold for the ticket
        for (let j = 0; j < bookings.length; j++) {
          const booking = bookings[j];
          subtotal += booking.price * booking.quantity;
        }
        total += subtotal;
      }
    }

    const totalNetSales = total - total * 0.225;

    return res.status(200).json({
      status: 'success',
      data: {
        totalGrossSales: total,
        totalNetSales,
        salesByType,
      },
    });
  }

  //logic without net sales

  const tickets2 = await Ticket.find({ eventID: req.params.id })
    .skip(skip)
    .limit(limit);

  let salesByType = [];
  salesByType = tickets2;
  return res.status(200).json({
    status: 'success',
    data: {
      salesByType,
    },
  });
});
