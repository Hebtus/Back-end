const User = require('../../models/userModel');

//creates our hamada who we all know for testing purposes
exports.createTestUser = async () => {
  const testUser = new User({
    name: {
      firstName: 'Mohammed',
      lastName: 'Hamada',
    },
    email: 'lol@lol.com',
    location: { coordinates: [-91.32, 1.32] },
    password: '123456789',
    passwordChangedAt: '1987-09-28 20:01:07',
    accountConfirmation: 1,
  });
  await testUser.save();
};
