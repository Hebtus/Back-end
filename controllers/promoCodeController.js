const { promisify } = require('util');
const crypto = require('crypto');
const Event = require('../models/eventModel');
const Ticket = require('../models/ticketModel');
const promoCode = require('../models/promoCodeModel');
const catchAsync = require('../utils/catchAsync');

exports.createPromoCode = catchAsync(async (req, res, next) => {
  //first check that the user is the creator of the event that the ticket is associated with

  const ticket = await Ticket.findOne({ _id: req.params.id }).catch(() =>
    res.status(400).json({
      status: 'fail',
      message: 'No ticket found with this id ',
    })
  );
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

  res.status(200).json({
    status: 'success',
    message: 'PromoCode created Successfully.',
  });
});
