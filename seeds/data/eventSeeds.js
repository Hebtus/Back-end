const { faker } = require('@faker-js/faker');

module.exports = (userIDs) => {
  const eventObjects = [];

  for (let i = 0; i < 20; i += 1) {
    const eventObject = {
      name: `event${i}`,
      img_url: faker.image.imageUrl(),
      startDate: faker.date.past(),
      endDate: faker.date.future(),
      location: {
        coordinates: [faker.address.longitude(), faker.address.latitude()],
        // lat: faker.address.latitude(),
        // lng: faker.address.longitude(),
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
