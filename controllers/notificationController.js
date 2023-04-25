const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');

/**
 * The Controller responsible for dealing with notifications
 * @module Controllers/notificationController
 */

/**
 * @function
 * @description -called to get the event tickets given the event id in the parameters and make sure the ticket is available and on display through the date
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @returns {object} - Returns the response object
 */
exports.getNotification = async (req, res) => {
  //check on 2 things for ticket availability: 1. time 2. capacity
  const notification = await Notification.findOne({ attendeeID: req.user._id });
  if (!notification) {
    return res
      .status(404)
      .json({ status: 'fail', message: 'no notifications currently' });
  }
  await Notification.deleteOne({ attendeeID: req.user._id });
  return res.status(200).json({
    status: 'success',
    data: {
      notification,
    },
  });
};
