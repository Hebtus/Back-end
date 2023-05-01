const { faker } = require('@faker-js/faker');

module.exports.seedPromocodes = (event) => {
  const promoCodeObjects = [];

  for (let i = 0; i < 2; i += 1) {
    const promoCodeObject = {
      codeName: `${event.name} PromoCode${i}`,
      limits: faker.datatype.number(100),
      percentage: faker.datatype.number(100),
      discountAmount: faker.datatype.number(100),
      discountorPercentage: [true, false][i % 2],
      eventID: event.eventID,
      fake: 1,
    };
    promoCodeObjects.push(promoCodeObject);
  }

  return promoCodeObjects;
};
