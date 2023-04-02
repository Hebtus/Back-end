const Event = require('../models/eventModel');
const auth = require('./authenticationController');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getEvent = catchAsync(async (req, res, next) => {
  //console.log(req.user);
  const event = await Event.findOne({ _id: req.params.id });
  if (!event) {
    res.status(404).json({
      status: 'fail',
      message: 'No event found with this id ',
    });
  } else if (!event.creatorID.equals('6428d14e2548b83651dd7a12')) {
    res.status(404).json({
      status: 'fail',
      message: 'You cannot access events that are not yours ',
    });
  } else {
    res.status(200).json({
      status: 'success',
      data: event,
    });
  }
  next();
});
