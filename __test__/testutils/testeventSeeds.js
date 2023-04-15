const { faker } = require('@faker-js/faker');

exports.eventsWithinUserRange = (userIDs) => {
  const eventObjects = [];

  for (let i = 0; i < 20; i += 1) {
    const eventObject = {
      name: `event${i}`,
      img_url: faker.image.imageUrl(),
      startDate: faker.date.past(),
      endDate: faker.date.future(),
      location: {
        //29.972930, 31.214039
        //30.118752, 31.203095
        coordinates: [
          faker.address.latitude(31.214039, 31.203095),
          faker.address.longitude(30.118752, 29.97293), //max min
        ],
        // lat: faker.address.latitude(31.203095, 31.214039),
        // lng: faker.address.longitude(29.2972, 30.118752),
      },
      locationName: faker.address.streetAddress(),
      category: ['Music', 'Food & Drink', 'Charity & Causes'][i % 3],
      description: faker.lorem.paragraph(2),
      creatorID: userIDs[i % 5],
      draft: false,
      privacy: false,
    };
    eventObjects.push(eventObject);
  }

  return eventObjects;
};

exports.eventsNotWithinRange = (userIDs) => {
  const eventObjects = [];

  for (let i = 0; i < 20; i += 1) {
    const eventObject = {
      name: `event${i}`,
      img_url: faker.image.imageUrl(),
      startDate: faker.date.past(),
      endDate: faker.date.past(),
      location: {
        //29.972930, 31.214039
        //30.118752, 31.203095
        coordinates: [
          faker.address.latitude(80, 52),
          faker.address.longitude(90, 40),
        ],
        // lat: faker.address.latitude(52, 80),
        // lng: faker.address.longitude(40, 90),
      },
      locationName: faker.address.streetAddress(),
      category: ['Music', 'Food & Drink', 'Charity & Causes'][i % 3],
      description: faker.lorem.paragraph(2),
      creatorID: userIDs[i % 5],
      draft: false,
      privacy: false,
    };
    eventObjects.push(eventObject);
  }

  return eventObjects;
};

exports.eventsWithinDateRange = (userIDs, startDateIn, endDateIn) => {
  const eventObjects = [];

  for (let i = 0; i < 10; i += 1) {
    const eventObject = {
      name: `event${i}`,
      img_url: faker.image.imageUrl(),
      // startDate: new Date('2023-05-2T10:16:10.467z').toISOString(),
      // endDate: new Date('2023-05-13T10:16:10.467z').toISOString(),
      startDate: startDateIn,
      endDate: endDateIn,
      location: {
        coordinates: [
          faker.address.latitude(31.214039, 31.203095),
          faker.address.longitude(30.118752, 29.97293), //max min
        ],
      },
      locationName: faker.address.streetAddress(),
      category: ['Music', 'Food & Drink', 'Charity & Causes'][i % 3],
      description: faker.lorem.paragraph(2),
      creatorID: userIDs[i % 5],
      draft: false,
      privacy: false,
    };
    eventObjects.push(eventObject);
  }

  return eventObjects;
};
