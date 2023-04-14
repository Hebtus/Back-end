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
        lat: faker.address.latitude(),
        lng: faker.address.longitude(),
      },
      locationName: faker.address.streetAddress(),
      category: ['Music', 'Food & Drink', 'Charity & Causes'][i % 3],
      description: faker.lorem.paragraph(),
      creatorID: userIDs[i % 5],
      draft: false,
      privacy: false,
    };
    eventObjects.push(eventObject);
  }

  return eventObjects;
};
