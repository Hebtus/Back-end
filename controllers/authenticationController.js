const dotenv = require('dotenv');
const crypto = require('crypto');
//const passport = require('passport');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const validator = require('validator');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const EmailConfirm = require('../models/emailConfirmModel');
const PasswordReset = require('../models/passwordResetModel');

dotenv.config({ path: '.config.env' });

/**
 * The Controller responsible for handling authentication Requests
 * @module Controllers/authenticationController
 */

/**
 * @description - Creates Jwt Token.
 * @param {string} id
 * @returns {Object } JWTtoken
 */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

//creates token and attaches it to cookie.
const createToken = (user, res) => {
  const token = signToken(user._id);
  res.token = token;
};

//creates token, attaches it to cookie and sends it as a standard responsee
const createSendToken = (user, statusCode, res) => {
  createToken(user, res);
  // res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token: res.token,
    data: {
      user,
    },
  });
};
/**
 * @description - deactivates the email of the current logged in user but has to enter his password for security purposes
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @param {object} next -The next object for express middleware
 * @param {object} next -The next object for express middleware
 */
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  console.log('entered protection');
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (req.body.token) token = req.body.token;
  if (req.headers.token) token = req.headers.token;

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  // 2) Verification token

  //still needs to handle invalid token error tho I think
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  ).catch((error) => {
    next(new AppError('Could not decode token.', 401));
    // Handle the error.
  });

  // })(token, process.env.JWT_SECRET);
  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }
  //we'll see if we add changed pass after or just use changed at and compare hashoof kda
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

/**
 * @description - Creates confirmEmail token and sends it via email.
 * @param {object} user -The user document
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @param {object} next -The next object for express middleware
 */
const SendConfirmationEmail = async (user, req, res, next) => {
  //generate confirm token first
  const confirmToken = await EmailConfirm.createEmailConfirmToken(user._id);
  let confirmURL;
  if (process.env.NODE_ENV === 'development') {
    confirmURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/signup-confirm/${confirmToken}`;
  } else if (process.env.NODE_ENV === 'production') {
    confirmURL = `${process.env.BACKEND_URL}/signup-confirm/${confirmToken}`;
  }
  const message = `Thank you for signing up! To complete creating your account please verify your email address: ${confirmURL}.\n`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Verify your Hebtus Account ',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Check your email for confirmation!',
    });
  } catch (err) {
    //delete user and respective confirmation token
    await EmailConfirm.findOneAndDelete({ userID: user._id });
    await User.findByIdAndDelete(user._id);
    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
};

//  * @exports authenticationController:signup

/**
 * @function
 * @description  Handles the Sign up request.
 * @async
 * @name signup
 * @param {object} req - The request object
 * @param {object} res - The response object
 * @param {object} next - The next object for express middleware
 * @returns {object} - Returns the response object
 */
exports.signup = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  //check if user exists:
  const existingUser = await User.findOne({
    email: req.body.email,
  });
  if (existingUser !== null) {
    const emailconfirm = await EmailConfirm.findOne({
      userID: existingUser._id,
    });

    if (emailconfirm !== null) {
      // console.log('emailconfirm is', emailconfirm);
      //already sent before
      return res.status(400).json({
        status: 'fail',
        message: 'Email confirmation already sent!',
      });

      //not found, then either he had already confirmed
    } else if (existingUser.accountConfirmation) {
      exports.login(req, res, next);
    } else {
      // or the token had expired and was removed from DB
      SendConfirmationEmail(existingUser, req, res, next);
    }

    return;
  }

  //login already checks for password and email
  // so we check here also
  if (
    !req.body.password ||
    !req.body.email ||
    !req.body.name.firstName ||
    !req.body.name.lastName
  ) {
    return res.status(400).json({
      status: 'fail',
      message: 'Please Enter password and email and name!',
    });
  }
  // console.log(typeof req.body.password, typeof req.body.confirmPassword);
  // console.log(req.body.confirmPassword);
  if (req.body.password !== req.body.confirmPassword) {
    return res.status(400).json({
      status: 'fail',
      message: 'Password and confirm Passwords do not match!',
    });
  }

  //create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordChangedAt: Date.now(), //Not sure of this please check ya yasmine
  });
  SendConfirmationEmail(user, req, res, next);
});

/**
 * @function
 * @description - Confirms email and then lets user in.
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @param {object} next -The next object for express middleware
 * @returns {object} - Returns the response object
 */
exports.confirmEmail = catchAsync(async (req, res, next) => {
  // // 1) Get user based on the token
  console.log('reached confirm email route');
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.confirmationToken)
    .digest('hex');

  const emailConfirmationDoc = await EmailConfirm.findOne({
    confirmationToken: hashedToken,
    confirmationTokenExpiry: { $gt: Date.now() },
  });
  // // 2) If token has not expired, and there is user, set the new password
  if (!emailConfirmationDoc) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  // 3) Get user and update relevant info
  const user = await User.findOne({ _id: emailConfirmationDoc.userID });

  user.accountConfirmation = true;
  await user.save();

  //delete confirmation (if the code reaches here aslun??? )
  await EmailConfirm.deleteOne(emailConfirmationDoc);
  // // 4) Log the user in, send JWT
  // createSendToken(user, 200, req, res);
  createSendToken(user, 200, res);
});

/**
 * @function
 * @description - Handles Login request.
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @param {object} next -The next object for express middleware
 * @returns {object} - Returns the response object
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return res.status(401).json({
      status: 'fail',
      message: 'Please provide email and password!',
    });
    next();
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      status: 'fail',
      message: 'Incorrect email or password!',
    });
    next();
  }
  if (!user.accountConfirmation) {
    // return next(new AppError('User not confirmed', 401));
    return res.status(401).json({
      status: 'fail',
      message: 'User not confirmed, please confirm the user through email!',
    });
    // next();
  }

  // await user.save({ validateBeforeSave: 0 }); //to handle password changed at
  await user.save(); //to handle password changed at
  // 4) If everything ok, send token to client
  createSendToken(user, 200, res);
});

/**
 * @function
 * @description - Handles the logout logic.
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @param {object} next -The next object for express middleware
 * @returns {object} - Returns the response object
 */
exports.logout = catchAsync(async (req, res, next) => {
  res
    .status(200)
    .json({ status: 'success', message: 'Successfully logged out' });
});

/**


@function
@description Send a password reset token to the user's email address.
@async
@name forgotPassword
@param {object} req - Express request object.
@param {object} res - Express response object.
@param {function} next - Express next middleware function.
@throws {AppError} If the email address is not valid or the user is not found.
@throws {AppError} If there is an error sending the reset email.
@returns {Promise<void>} Sends a JSON response with a success or failure message.
*/
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on posted email
  const { email } = req.body;
  if (!(email && validator.isEmail(email))) {
    // return next(new AppError('Please provide a valid email address', 400));
    return res.status(400).json({
      status: 'failed',
      message: 'Please provide a valid email address',
    });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      status: 'failed',
      message: 'There is no user with this email address',
    });
    //return next(new AppError('There is no user with this email address', 404));
  }

  // 2) Create random reset token
  const resetToken = await PasswordReset.createResetPasswordToken(user._id);

  //3) send the reset token to the user email address
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/resetpassword/${resetToken}`;
  const message = `Forgot your password lol ? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }

  next();
});
/**
 * @description Reset the user's password.
 * @function
 * @async
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next function.
 * @returns {Promise<void>} - Promise that resolves once the password reset is complete.
 * @throws {AppError} - Throws an AppError if the token is invalid or has expired.
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const passwordResetDoc = await PasswordReset.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiry: { $gt: Date.now() },
  });
  if (!passwordResetDoc)
    return res.status(400).json({
      status: 'fail',
      message: 'Token is invalid',
    });
  const user = await User.findById(passwordResetDoc.userID);
  if (!user)
    return res.status(400).json({
      status: 'fail',
      message: 'Token is invalid',
    });
  //2) If token not expired and user exists, set the new password
  if (req.body.password !== req.body.confirmPassword)
    return res.status(400).json({
      status: 'fail',
      message: 'confirm password doesnt match',
    });
  user.password = req.body.password;
  user.passwordChangedAt = Date.now();
  passwordResetDoc.passwordResetTokenExpiry = undefined;
  passwordResetDoc.passwordResetToken = undefined;
  await user.save();
  //4) Send JWT to let the user log in
  //A Decision needs to be done here according to complications
  //and discussions with Frontend. -Joseph
  createSendToken(user, 200, res);
  await passwordResetDoc.save();
});

// exports.resetPassword = catchAsync(async (req, res, next) => {
//   res.status('200').json({
//     status: 'success',
//     message: '3azama',
//   });
// });

/**
 * @function
 * @description - updates current user password
 * @param {object} req  -The request object
 * @param {object} res  -The response object
 * @param {object} next -The next object for express middleware
 * @returns {Object} userObject
 */
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  console.log('Received req on update password');
  const user = await User.findById(req.user._id).select('+password');
  if (!user) throw new AppError('Invalid User', 400);

  //check if password != confirmpassword
  if (req.body.password !== req.body.confirmPassword) {
    res.status(401).json({
      status: 'failed',
      message: 'confirm password doesnt match',
    });
    return next(new AppError('confirm password doesnt match', 401));
  }
  // 2) Check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    res.status(401).json({
      status: 'failed',
      message: 'Your current password is wrong.',
    });
    return next(new AppError('Your current password is wrong.', 401));
  }
  // 3) update Password in the DB
  user.password = req.body.password;
  res.status(200).json({
    status: 'success',
    message: 'password updated successfully',
  });
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!
});
