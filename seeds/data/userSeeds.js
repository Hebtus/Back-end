const { faker } = require('@faker-js/faker');

module.exports = () => {
  const userObjects = [];

  for (let i = 0; i < 5; i += 1) {
    const userObject = {
      name: { firstName: `user${i}`, lastName: `user${i}tany` },
      email: `user${i}@fake.com`,
      password: 'password',
      accountConfirmation: true,
      fake: 1,
    };
    userObjects.push(userObject);
  }

  return userObjects;
};
