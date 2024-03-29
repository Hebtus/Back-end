/* eslint-disable eqeqeq */
const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  codeName: {
    type: String,
    required: [true, 'Please provide a code name'],
    minlength: [1, 'Event Name can not be less than 1 character.'],
    maxlength: [30, 'Event Name can not be more than 30 characters long.'],
  },
  limits: {
    //capacity of promoCode
    type: Number,
    required: [true, 'Please sepcify the promocode limits'],
    min: [1, 'Minimum limit cannot be less than 1'],
    max: [10000000, 'Maximum Conceivable capacity reached'],
    default: 1,
  },
  percentage: {
    type: Number,
    min: [0, 'Minimum percentage cannot be less than 0'],
    max: [100, 'Maximum percentage cannot be more than 100'],
  },
  discountAmount: {
    type: Number,
    min: [0, 'Minimum Discount Amount cannot be less than 0'],
  },
  uses: {
    //The actual number of times a promoCode was used
    type: Number,
    min: [0, 'Minimum uses cannot be less than 0'],
    max: [10000000, 'Maximum Conceivable capacity reached'],
    default: 0,
  },
  discountOrPercentage: {
    required: [true, 'You must define is the promoCode discount or percentage'],
    type: Boolean,
  },
  eventID: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'PromoCode must belong to an event.'],
  },
});

//pre(Save) runs before save and create
//makes sure that either percentage or discount amount are given
promoCodeSchema.pre('save', function (next) {
  if (this.discountOrPercentage === null)
    return next(
      new Error('You must define is the promoCode discount or percentage')
    );
  if (!this.percentage && !this.discountAmount)
    return next(
      new Error('At least one of percentage or discountAmount should be given')
    );
  if (this.discountOrPercentage == 1 && !this.discountAmount)
    return next(
      new Error(
        'Discount amount is required in case of discountOrPercentage =1 '
      )
    );
  if (this.discountOrPercentage == 0 && !this.percentage)
    return next(
      new Error('Percentage is required in case of discountOrPercentage =0 ')
    );

  //make sure that the number of uses never exceeds current capacity
  if (this.uses > this.limits)
    return next(new Error('Uses cannot be bigger than limit!'));
  next();
});

//makes sure that the number of uses never exceeds current capacity
promoCodeSchema.pre('update', function (next) {
  // console.log('uses are ', this.uses);
  // console.log(this.limits);
  if (this.uses > this.limits)
    return next(new Error('Uses cannot be bigger than limit!'));
  next();
});

//All find querries
promoCodeSchema.pre(/^find/, function (next) {
  this.select({
    __v: 0,
  });
  next();
});

promoCodeSchema.index({ codeName: 1, eventID: 1 }, { unique: true });

const PromoCode = mongoose.model('PromoCode', promoCodeSchema);

module.exports = PromoCode;
