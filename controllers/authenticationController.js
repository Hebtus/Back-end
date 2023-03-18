const crypto = require('crypto');
//const passport = require('passport');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const EmailConfirm = require('../models/emailConfirmModel');
// const PasswordReset = require('../models/passwordResetModel');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove critical information from output
  user.password = undefined;
  user.passwordChangedAt = undefined;
  user.accountConfirmation = undefined;
  user.activeStatus = undefined;

  res.status(statusCode).json({
    status: 'success',
    data: {
      user,
    },
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

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
  /* if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }
*/ //we'll see if we add changed pass after or just use changed at and compare hashoof kda
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
const SendConfirmationEmail = async (user, req, res, next) => {
  //generate confirm token first
  const confirmToken = await user.createEmailConfirmToken();
  const confirmURL = `${req.protocol}://${req.get(
    'host'
  )}/signup-confirm/${confirmToken}`;

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
exports.signup = catchAsync(async (req, res, next) => {
  //check if user exists:
  const existingUser = await User.findOne({
    email: req.body.email,
  });
  if (existingUser !== null) {
    const emailconfirm = await EmailConfirm.findOne({
      userID: existingUser._id,
    });

    if (emailconfirm !== null) {
      console.log('emailconfirm is', emailconfirm);
      //already sent before
      res.status(400).json({
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
    !req.body.name.firstName
  ) {
    res.status(400).json({
      status: 'fail',
      message: 'Please Enter password and email and name!',
    });
  }
  if (req.body.password !== req.body.confirmPassword) {
    res.status(400).json({
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

exports.confirmEmail = catchAsync(async (req, res, next) => {
  // // 1) Get user based on the token
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
  user.activeStatus = true;
  await user.save();

  // // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res);

  //delete confirmation (if the code reaches here aslun??? )
  // yessss it doesss
  await EmailConfirm.deleteOne(emailConfirmationDoc);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exist
  if (!email || !password) {
    res.status(400).json({
      status: 'fail',
      message: 'Please provide email and password!',
    });
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    res.status(401).json({
      status: 'fail',
      message: 'Incorrect email or password!',
    });
  }
  if (!user.activeStatus) {
    // return next(new AppError('User not confirmed', 401));
    res.status(401).json({
      status: 'fail',
      message: 'User not confirmed, please confirm the user through email!',
    });
  }
  // 3) Activate user by default

  user.activeStatus = 1;
  // console.log('user is ', user);
  // await user.save({ validateBeforeSave: 0 }); //to handle password changed at
  await user.save(); //to handle password changed at
  // 4) If everything ok, send token to client
  createSendToken(user, 200, req, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  //overwrite cookie at client side and set it to expire after 2 seconds
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });
  res
    .status(200)
    .json({ status: 'success', message: 'Successfully logged out' });
});

exports.facebookLogin = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama',
  });
});
exports.googleLogin = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama',
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama',
  });
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  res.status('200').json({
    status: 'success',
    message: '3azama',
  });
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  //check if password != confirmpassword
  if (req.body.password !== req.body.confirmPassword) {
    return next(new AppError('confirm password doesnt match', 401));
  }
  // 2) Check if posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  user.password = req.body.password;

  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

exports.deactivateAccount = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.activeStatus === true) user.activeStatus = false;
  else user.activeStatus = true;

  try {
    await user.save();
    return res.status(200).json({ status: 'Success', success: true });
  } catch (err) {
    throw new AppError(`Something went wrong`, 500);
  }
});
