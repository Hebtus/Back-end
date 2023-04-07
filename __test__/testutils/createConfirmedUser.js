const User = require('../../models/userModel');

//creates our hamada who we all know for testing purposes
exports.createTestUser = async () => {
  const testUser = new User({
    name: {
      firstName: 'Mohammed',
      lastName: 'Hamada',
    },
    email: 'irushbullet@gmail.com',
    location: { coordinates: [-91.32, 1.32] },
    password: '123456789',
    passwordChangedAt: '1987-09-28 20:01:07',
    accountConfirmation: 1,
  });
  // try {
  //   let user = await User.findOne({ email: });
  //   if (user) {
  //     done(null, user);
  //   } else {
  //     user = await User.create(newUser);
  //     done(null, user);
  //   }
  // } catch (err) {
  //   console.error(err);
  // }
  const test = await testUser.save();
  return test;
};

exports.createTestUser2 = async () => {
  const testUser = new User({
    name: {
      firstName: 'Mohammed',
      lastName: 'Mahmoud',
    },
    email: 'irushbulleter@gmail.com',
    location: { coordinates: [-91.32, 1.32] },
    password: '123456789',
    passwordChangedAt: '1987-09-28 20:01:07',
    accountConfirmation: 1,
  });
  // try {
  //   let user = await User.findOne({ email: });
  //   if (user) {
  //     done(null, user);
  //   } else {
  //     user = await User.create(newUser);
  //     done(null, user);
  //   }
  // } catch (err) {
  //   console.error(err);
  // }
  const test = await testUser.save();
  return test;
};
