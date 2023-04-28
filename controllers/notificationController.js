const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');

/**
 * The Controller responsible for dealing with notifications
 * @module Controllers/notificationController
 */

/** 
@function
@description the function gets notifications of a the logged user display them for him then delete them
@async
@name getNotification
@param {object} req - Express request object.
@param {object} res - Express response object.
@returns {object} - Returns the response object 
*/
exports.getNotification = async (req, res) => {
  //check on 2 things for ticket availability: 1. time 2. capacity
  const notification = await Notification.findOne({ attendeeID: req.user._id });
  if (!notification) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'no notifications currently' });
  }
  res.status(200).json({
    status: 'success',
    data: {
      notification,
    },
  });
  await Notification.deleteOne({ attendeeID: req.user._id });
};
