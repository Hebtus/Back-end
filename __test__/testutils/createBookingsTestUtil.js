/* eslint-disable node/no-unsupported-features/es-syntax */

const Ticket = require('../../models/ticketModel');
const Event = require('../../models/eventModel');

exports.requestBody = async () => {
  let eventID;
  let ticket1ID;
  let ticket2ID;
  let reqBody1;
  const event1 = await Event.create({
    name: 'My Event',
    startDate: '2023-05-01T00:00:00.000Z',
    endDate: '2023-05-03T00:00:00.000Z',
    locationName: 'My Event Location',
    category: 'Music',
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.73061],
    },
  }).then((doc) => {
    eventID = doc.id;
  });
  const ticket1 = await Ticket.create({
    eventID: eventID,
    name: 'Premium',
    type: 'VIP',
    price: 100,
    capacity: 20,
    sellingStartTime: '2027-02-21 12:00:00',
    sellingEndTime: '2028-02-22 12:00:00',
  }).then((doc) => {
    //console.log(doc);
    ticket1ID = doc.id;
  });
  const ticket2 = await Ticket.create({
    eventID: eventID,
    name: 'Normal Seat',
    type: 'VIP',
    price: 50,
    capacity: 90,
    sellingStartTime: '2027-02-21 12:00:00',
    sellingEndTime: '2028-02-22 12:00:00',
  }).then((doc) => {
    ticket2ID = doc.id;
  });

  reqBody1 = {
    userID: '642deb80b1aba5ec6366f9a7',
    eventID: eventID,
    name: {
      firstName: 'John',
      lastName: 'Smither',
    },
    guestEmail: 'canbeDifferentFromuserEmail@gmail.com',
    phoneNumber: '01030486357',
    gender: 'Male',
    promoCode: 'mono',
    bookings: [
      {
        ticketID: ticket1ID,
        price: 100,
        quantity: 1,
      },
      {
        ticketID: ticket2ID,
        price: 50,
        quantity: 1,
      },
    ],
  };

  const reqBody2 = { ...reqBody1 };
  const reqBody3 = { ...reqBody1 };
  reqBody3.promoCode = 'lol';
  reqBody2.gender = 'lol';
  return { reqBody1, reqBody2, reqBody3 };
};

exports.requestBody2 = async (creatorID) => {
  let eventID;
  let eventID2;
  let ticket1ID;
  let ticket2ID;

  const event1 = await Event.create({
    name: 'My Event',
    startDate: '2023-05-01T00:00:00.000Z',
    endDate: '2023-05-03T00:00:00.000Z',
    locationName: 'My Event Location',
    category: 'Music',
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.73061],
    },
    creatorID: creatorID,
  }).then((doc) => {
    eventID = doc.id;
  });
  const event2 = await Event.create({
    name: 'My Event 2',
    startDate: '2023-05-01T00:00:00.000Z',
    endDate: '2023-05-03T00:00:00.000Z',
    locationName: 'My Event Location',
    category: 'Music',
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.73061],
    },
    creatorID: '6448c4c758a9a5b7a81240db',
  }).then((doc) => {
    eventID2 = doc.id;
  });
  const ticket1 = await Ticket.create({
    eventID: eventID,
    name: 'Premium',
    type: 'VIP',
    price: 100,
    capacity: 20,
    sellingStartTime: '2027-02-21 12:00:00',
    sellingEndTime: '2028-02-22 12:00:00',
  }).then((doc) => {
    //console.log(doc);
    ticket1ID = doc.id;
  });
  const ticket2 = await Ticket.create({
    eventID: eventID2,
    name: 'Trash',
    type: 'VIP',
    price: 100,
    capacity: 20,
    sellingStartTime: '2027-02-21 12:00:00',
    sellingEndTime: '2028-02-22 12:00:00',
  }).then((doc) => {
    //console.log(doc);
    ticket2ID = doc.id;
  });

  const reqBody1 = {
    ticketID: ticket1ID,
    eventID: eventID,
    name: {
      firstName: 'John',
      lastName: 'Smither',
    },
    phoneNumber: '01030486357',
    gender: 'Male',
    guestEmail: 'canbeDifferentFromuserEmail@gmail.com',
    price: 100,
    quantity: 3,
  };

  const reqBody2 = { ...reqBody1 };

  reqBody2.eventID = eventID2;
  reqBody2.ticketID = ticket2ID;

  const reqBody3 = { ...reqBody1 };
  reqBody3.gender = 'lol';
  return { reqBody1, reqBody2, reqBody3 };
};
