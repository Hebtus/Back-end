const { faker } = require('@faker-js/faker');

module.exports.seedEvents = (userIDs) => {
  const eventObjects = [];

  for (let i = 0; i < 5; i += 1) {
    const eventObject = {
      name: `RealEvent${i}`,
      img_url: faker.image.imageUrl(640, 480, 'cat', true),
      startDate: faker.date.past(2),
      endDate: faker.date.future(2),
      location: {
        coordinates: [
          faker.address.longitude(31.214039, 31.203095),
          faker.address.latitude(30.118752, 29.97293), //max min
        ],
      },
      locationName: faker.address.streetAddress(),
      category: ['Music', 'Food & Drink', 'Charity & Causes'][i % 3],
      description: faker.lorem.paragraph(2),
      creatorID: userIDs[i % 5],
      draft: false,
      privacy: false,
      fake: 1,
    };
    eventObjects.push(eventObject);
  }

  return eventObjects;
};

module.exports.seedPastEvents = (userIDs) => {
  const eventObjects = [];

  for (let i = 0; i < 5; i += 1) {
    const endDate = faker.date.past(1);
    const eventObject = {
      name: `PastEvent${i}`,
      img_url: faker.image.imageUrl(640, 480, 'food', true),
      startDate: faker.date.past(2, endDate),
      endDate: endDate,
      location: {
        coordinates: [
          faker.address.longitude(31.214039, 31.203095),
          faker.address.latitude(30.118752, 29.97293), //max min
        ],
      },
      locationName: faker.address.streetAddress(),
      category: ['Music', 'Food & Drink', 'Charity & Causes'][i % 3],
      description: faker.lorem.paragraph(2),
      creatorID: userIDs[i % 5],
      draft: false,
      privacy: false,
      fake: 1,
    };
    eventObjects.push(eventObject);
  }

  return eventObjects;
};

module.exports.seedFutureEvents = (userIDs) => {
  const eventObjects = [];

  for (let i = 0; i < 5; i += 1) {
    const startDate = faker.date.future(1);

    const eventObject = {
      name: `FutureEvent${i}`,
      img_url: faker.image.imageUrl(640, 480, 'food', true),
      startDate: startDate,
      endDate: faker.date.future(2, startDate),
      location: {
        coordinates: [
          faker.address.longitude(31.214039, 31.203095),
          faker.address.latitude(30.118752, 29.97293), //max min
        ],
      },
      locationName: faker.address.streetAddress(),
      category: ['Music', 'Food & Drink', 'Charity & Causes'][i % 3],
      description: faker.lorem.paragraph(2),
      creatorID: userIDs[i % 5],
      draft: false,
      privacy: false,
      fake: 1,
    };
    eventObjects.push(eventObject);
  }

  return eventObjects;
};

// Right Lat 38.8937845
// left Lat 37.7577331
// Top Long -101.3486337
// Bottom Long -110.1499798
module.exports.seedAwayEvents = (userIDs) => {
  const eventObjects = [];

  for (let i = 0; i < 5; i += 1) {
    const eventObject = {
      name: `AwayEvent${i}`,
      img_url: faker.image.nightlife(640, 480, true),
      startDate: faker.date.past(2),
      endDate: faker.date.future(2),
      location: {
        //cooordinates are from US on the limits of the US Like washington, San francisco, Texas and Minot in North Dakota
        coordinates: [
          faker.address.longitude(-101.3486337, -110.1499798),
          faker.address.latitude(38.8937845, 37.7577331), //max min
        ],
      },
      locationName: faker.address.streetAddress(),
      category: ['Music', 'Food & Drink', 'Charity & Causes'][i % 3],
      description: faker.lorem.paragraph(2),
      creatorID: userIDs[i % 5],
      draft: false,
      privacy: false,
      fake: 1,
    };
    eventObjects.push(eventObject);
  }

  return eventObjects;
};
