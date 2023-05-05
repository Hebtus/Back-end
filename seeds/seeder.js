/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable no-restricted-syntax */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const { faker } = require('@faker-js/faker');
const userSeeds = require('./data/userSeeds');
const eventSeeds = require('./data/eventSeeds');
const ticketSeeds = require('./data/ticketSeeds');
const bookingSeeds = require('./data/bookingSeeds');
const promoCodeSeeds = require('./data/promoCodeSeeds');
const User = require('../models/userModel');
const Event = require('../models/eventModel');
const Ticket = require('../models/ticketModel');
const PromoCode = require('../models/promoCodeModel');
const Booking = require('../models/bookingModel');

module.exports.Seed = async function (DbString) {
  //Database connection

  mongoose
    .connect(DbString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('DB is connected successfuly!');
    });

  //************Users **********************//
  var users = await User.find({ email: { $regex: 'fake' } }); //
  if (users.length === 0) {
    const userObjects = userSeeds();
    users = await User.create(userObjects, { validateBeforeSave: false });
  }

  const userIDs = users.map((user) => user._id);
  //we see main events first (exist here and are active now)
  var mainEvents = await Event.find({ name: { $regex: 'RealEvent' } });
  var pastEvents = await Event.find({ name: { $regex: 'PastEvent' } });
  var futureEvents = await Event.find({ name: { $regex: 'FutureEvent' } });
  var awayEvents = await Event.find({ name: { $regex: 'AwayEvent' } });
  if (mainEvents.length === 0) {
    console.log('seeding events');
    const mainEventObjects = eventSeeds.seedEvents(userIDs);
    mainEvents = await Event.create(mainEventObjects, {
      validateBeforeSave: false,
    });
    //past events
    const pastEventObject = eventSeeds.seedPastEvents(userIDs);
    pastEvents = await Event.create(pastEventObject, {
      validateBeforeSave: false,
    });
    //future events
    const futureEventObject = eventSeeds.seedFutureEvents(userIDs);
    futureEvents = await Event.create(futureEventObject, {
      validateBeforeSave: false,
    });
    // events that are away
    const awayEventObjects = eventSeeds.seedAwayEvents(userIDs);
    awayEvents = await Event.create(awayEventObjects, {
      validateBeforeSave: false,
    });
  }
  //************Tickets **********************//

  var mainEventsTickets = await Ticket.find({ name: { $regex: 'RealEvent' } });
  var pastEventsTickets = await Ticket.find({ name: { $regex: 'PastEvent' } });
  if (mainEventsTickets.length === 0) {
    console.log('seeding tickets');
    for await (const event of mainEvents) {
      var mainEventTickets = ticketSeeds.seedTickets(event);
      mainEventTickets = await Ticket.create(mainEventTickets, {
        validateBeforeSave: false,
      });
      mainEventsTickets.push(mainEventTickets);
    }
    var pastEventsTickets = [];
    for await (const pastevent of pastEvents) {
      var pastEventTickets = ticketSeeds.seedTickets(pastevent);
      // console.log('pastEventTickets', pastEventTickets);
      pastEventTickets = await Ticket.create(pastEventTickets, {
        validateBeforeSave: false,
      });
      pastEventsTickets.push(pastEventTickets);
    }
    var futureEventsTickets = [];
    for await (const event of futureEvents) {
      var futureEventTickets = ticketSeeds.seedTickets(event);
      futureEventTickets = await Ticket.create(futureEventTickets, {
        validateBeforeSave: false,
      });
      futureEventsTickets.push(futureEventTickets);
    }

    var awayEventsTickets = [];
    for await (const event of awayEvents) {
      var awayEventTickets = ticketSeeds.seedTickets(event);
      awayEventTickets = await Ticket.create(awayEventTickets, {
        validateBeforeSave: false,
      });
      awayEventsTickets.push(awayEventTickets);
    }
    mainEventsTickets = mainEventsTickets.flat();
    pastEventsTickets = pastEventsTickets.flat();
    futureEventsTickets = futureEventsTickets.flat();
    awayEventsTickets = awayEventsTickets.flat();
  }

  // //************Bookings **********************//
  var mainEventBookings = await Booking.find({
    'name.firstName': { $regex: 'user' },
  });
  // console.log('mainEventBookings', mainEventBookings);
  if (mainEventBookings.length === 0) {
    console.log('seeding bookings');
    for await (const ticket of mainEventsTickets) {
      mainEventBookings = bookingSeeds.seedBookings(users, ticket, 0);
      mainEventBookings = await Booking.create(mainEventBookings, {
        validateBeforeSave: false,
      });
      mainEventBookings = bookingSeeds.seedBookings(users, ticket, 1);
      mainEventBookings = await Booking.create(mainEventBookings, {
        validateBeforeSave: false,
      });
    }
    for await (const ticket of pastEventsTickets) {
      var pastEventBookings = bookingSeeds.seedBookings(users, ticket, 0);
      pastEventBookings = await Booking.create(pastEventBookings, {
        validateBeforeSave: false,
      });
      var pastEventBookings = bookingSeeds.seedBookings(users, ticket, 1);
      pastEventBookings = await Booking.create(pastEventBookings, {
        validateBeforeSave: false,
      });
    }
  }

  // //************Promo Codes **********************//
  var mainEventPromoCodes = await PromoCode.find({
    codeName: { $regex: 'RealEvent' },
  });
  if (mainEventPromoCodes.length === 0) {
    console.log('seeding promo codes');
    for await (const event of mainEvents) {
      var mainEventPromoCodes = promoCodeSeeds.seedPromocodes(event);
      mainEventPromoCodes = await PromoCode.create(mainEventPromoCodes, {
        validateBeforeSave: false,
      });
    }
  }

  console.log('Seeds executed successfully');
};

module.exports.deleteSeeds = async function (DbString) {
  mongoose
    .connect(DbString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('DB is connected successfuly!');
    });

  await User.deleteMany({ email: { $regex: 'fake' } });
  await Booking.deleteMany({ email: { $regex: 'fake' } });
  await Event.deleteMany({ name: { $regex: 'RealEvent' } });
  await Ticket.deleteMany({ name: { $regex: 'RealEvent' } });
  await PromoCode.deleteMany({ codeName: { $regex: 'RealEvent' } });
};
