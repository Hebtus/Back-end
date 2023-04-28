const mongoose = require('mongoose');
const nameSchema = require('./shared/nameModel');

const notificationSchema = new mongoose.Schema({
  attendeeID: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  attendeeName: nameSchema,
  creatorName: nameSchema,
  eventName: {
    type: String,
    required: [true, 'An event must have a name.'],
    //unique: true,
    trim: true,
    maxlength: [40, 'An event must have less or more than 40 characters'],
    minlength: [1, 'An event must have less or equal than 10 characters'],
  },
});

//All find querries
notificationSchema.pre(/^find/, function (next) {
  this.select({
    __v: 0,
    attendeeID: 0,
    'attendeeName._id': 0,
    'creatorName._id': 0,
  });
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
