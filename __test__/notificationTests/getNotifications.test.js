const request = require('supertest');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const app = require('../../app');
const Event = require('../../models/eventModel');
const Ticket = require('../../models/ticketModel');
const Booking = require('../../models/bookingModel');
const Notification = require('../../models/notificationModel');
const loginConfirmedUser = require('../testutils/loginConfirmedUser');
const createConfirmedUser = require('../testutils/createConfirmedUser');
dotenv.config({ path: './config.env' });

const DBstring = process.env.TEST_DATABASE;

let testEvent;

beforeAll(async () => {
  // Connect to the test database
  await mongoose.connect(DBstring, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

test('Check correct returned not', async () => {
  const testUser = await createConfirmedUser.createTestUser();
  const jwtToken = await loginConfirmedUser.loginUser();
  
  const newNotification = await Notification.create({
    attendeeID: testUser._id,
    attendeeName: { firstName: 'Yasmin', lastName: 'Hashem' },
    creatorName: { firstName: 'YasminaBrdo', lastName: 'Hashem' },
    eventName: 'Atalanta Party 1',
  });
  await newNotification.save();
  const res = await request(app)
    .get(`/api/v1/notifications`)
    .set('authorization', `Bearer ${jwtToken}`)
    .expect(200);
});

afterAll(async () => {
  // Delete all test data and close the database connection
  await User.deleteMany();
  await Event.deleteMany();
  await Ticket.deleteMany();
  await Booking.deleteMany();
  await mongoose.connection.close();
});
