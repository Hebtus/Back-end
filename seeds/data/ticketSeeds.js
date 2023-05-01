const { faker } = require('@faker-js/faker');

module.exports.seedTickets = (event) => {
  const ticketObjects = [];
  for (let i = 0; i < 2; i += 1) {
    const startSellingTime = faker.date.between(event.startDate, event.endDate);
    // console.log(startSellingTime);
    // console.log(event.endDate);
    // console.log(faker.date.between(startSellingTime, event.endDate));
    const ticketObject = {
      name: `${event.name} RealTicket${i}`,
      type: ['Regular', 'VIP'][i % 2],
      price: faker.finance.amount(100, 1000),
      capacity: Math.floor(Math.random() * 100) + 7,
      sellingStartTime: startSellingTime,
      sellingEndTime: faker.date.between(startSellingTime, event.endDate),
      eventID: event._id,
      fake: 1,
    };
    ticketObjects.push(ticketObject);
  }

  return ticketObjects;
};
