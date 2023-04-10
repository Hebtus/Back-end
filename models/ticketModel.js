const mongoose = require('mongoose');
const validator = require('validator');
const Event = require('./eventModel');
const AppError = require('../utils/appError');

const ticketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a ticket name'],
    minlength: [1, 'Event Name can not be less than 1 character.'],
    maxlength: [30, 'Event Name can not be more than 30 characters long.'],
  },
  type: {
    type: String,
    required: [true, 'Please specify the ticket type'],
    enum: {
      //ticket types on the site itself are not in vip or not no
      values: ['VIP', 'Regular'],
      message: '{VALUE} is not supported',
    },
  },
  price: {
    type: Number,
    required: [true, 'A ticket must have a price'],
    min: 0,
  },
  capacity: {
    type: Number,
    required: [true, 'Please sepcify ticket capacity'],
    max: [10000000, 'Maximum Conceivable capacity reached'],
    min: [1, 'Minimum enumerable capacity should be greater than 0'],
    default: 1,
    validate: {
      validator: function (val) {
        return val >= this.currentReservations;
      },
      message: 'Capacity is below the current reservations',
    },
  },
  sellingStartTime: {
    type: Date,
    default: Date.now(),
    required: [true, 'Please provide a selling start  date'],
    validate: [
      {
        validator: validator.isDate,
        message: 'Date must be in the right date format.',
      },
      {
        validator: function (value) {
          return new Date(value) > new Date();
        },
        message: 'Date must be in the future',
      },
      {
        validator: function (value) {
          return value < this.sellingEndTime;
        },
        message: 'Start selling date must be before end selling date',
      },
    ],
  },
  sellingEndTime: {
    type: Date,
    required: [true, 'Please provide a selling end  date'],
    validate: [
      {
        validator: validator.isDate,
        message: 'Must be right date format.',
      },
      {
        validator: function (value) {
          return new Date(value) > new Date();
        },
        message: 'Date must be in the future',
      },
      {
        validator: function (value) {
          return value > this.sellingStartTime;
        },
        message: 'End selling date must be after start selling date',
      },
    ],
  },
  currentReservations: {
    type: Number,
    default: 0,
    max: [10000000, 'Maximum Conceivable capacity reached'],
    validate: {
      validator: function (val) {
        return val < this.capacity;
      },
      message: 'Current reservations exceeds the allowed capacity',
    },
  },
  eventID: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: [true, 'Ticket Type must belong to an event.'],
  },
});
//automatically adds 1 to ticketsSold in its respective Event
//findOneAndUpdate is called by findbyIdandUpdate
// ticketSchema.pre('findOneAndUpdate', async function (next) {
//   const currentReservationsInc = this._update.$inc.currentReservations;
//   // console.log(currentReservationsInc);
//   const docToUpdate = await this.model.findById(this._conditions._id);
//   // console.log(this.model);
//   // console.log(docToUpdate);

//   //check on capacity
//   if (
//     currentReservationsInc + docToUpdate.currentReservations >
//     docToUpdate.capacity
//   ) {
//     //do nothing
//     //or actually refuse update?
//     //make error to stop update?
//     next();
//   }
//   await Event.findByIdAndUpdate(docToUpdate.eventID, {
//     $inc: { ticketsSold: currentReservationsInc },
//   });
// });
// // ticketSchema.post('findByIdAndUpdate', async (doc) => {
// //   console.log(doc);
// //   await Event.findByIdAndUpdate(doc.eventID, {
// //     $inc: { ticketsSold: 1 },
// //   });
// // });
// //All find querries
ticketSchema.pre(/^find/, function (next) {
  this.select({
    __v: 0,
  });
  next();
});
// ticketSchema.pre('findOneAndUpdate', function (next) {
//   // this.options.runValidators = true;
//   const updateTicket = this.getUpdate();
//   const Ticket = this.findOne(this.getQuery());
//   if (updateTicket.sellingEndTime) {
//     const date = new Date(new Date(updateTicket.sellingEndTime).toISOString());
//     if (!validator.isDate(date)) {
//       //console.log(date);
//       next(new AppError('Date must ust be right date format.', 404));
//     }
//     if (date < new Date()) {
//       next(new AppError('Date must be in the future', 404));
//     }
//     if (Ticket.sellingStartTime > updateTicket.sellingEndTime) {
//       next(new AppError('End date must be after selling date', 404));
//     }
//   }
//   if (updateTicket.sellingStartTime) {
//     const date = new Date(new Date(updateTicket.sellingEndTime).toISOString());
//     if (!validator.isDate(date)) {
//       next(new AppError('Date must be right date format.', 404));
//     }
//     if (date < new Date()) {
//       next(new AppError('Date must be in the future', 404));
//     }
//     if (updateTicket.sellingStartTime > Ticket.sellingEndTime) {
//       next(new AppError('Start date must be before selling date', 404));
//     }
//   }
//   if (updateTicket.capacity) {
//     console.log(updateTicket.capacity, Ticket.currentReservations, 'lol');
//     if (updateTicket.capacity < Ticket.currentReservations)
//       next(new AppError('Capacity is below current reservations', 404));
//   }
//   if (updateTicket.currentReservations) {
//     if (updateTicket.currentReservations > Ticket.capacity)
//       next(
//         new AppError('Current reservations exceeds the allowed capacity', 404)
//       );
//   }
//   next();
// });

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;
