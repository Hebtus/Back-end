const { faker } = require('@faker-js/faker');

module.exports.seedBookings = (users, eventTicket, userNum) => {
  const bookingObjects = [];

  const bookingObject = {
    name: users[userNum].name,
    gender: ['Male', 'Female'][userNum % 2],
    phoneNumber: `'010'${faker.datatype.number({
      min: 10000000,
      max: 99999999,
    })}`,
    guestEmail: users[userNum].email,
    homeAdress: faker.address.streetAddress(),
    purchasedOn: faker.date.between(
      eventTicket.sellingStartTime,
      eventTicket.sellingEndTime
    ),
    price: eventTicket.price,
    quantity: 3,
    userID: users[0]._id,
    ticketID: eventTicket._id,
    eventID: eventTicket.eventID,
    fake: 1,
  };
  bookingObjects.push(bookingObject);

  return bookingObjects;
};
