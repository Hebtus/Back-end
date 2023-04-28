/** @module module:Utils */
/**
 * @function SendEmail
 * @requires nodemailer
 * @description Sends email and acts as an API with mail service.
 * @param {object} options  -The Email opions like mail, subject and message.
 */
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

const sendEmail = async (options) => {
  let transporter;
  if (process.env.NODE_ENV === 'development') {
    // 1) Create a transporter
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    // 2) Define the email options
    let mailOptions = {
      from: 'Hebtus Support <hello@hebtus.io>',
      to: options.email,
      subject: options.subject,
      //html: `'<p>'  ${options.message} <p>Here is your QR code:</p><img src="${options.image}">`,
      html: options.html,
    };
    console.log(mailOptions);
    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
  } else if (process.env.NODE_ENV === 'production') {
    // console.log(process.env.SENDGRID_VERIFIED_EMAIL);
    console.log('sending email in production');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // 2) Define the email options
    const mailOptions = {
      from: process.env.SENDGRID_VERIFIED_EMAIL,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };
    await sgMail.send(mailOptions);
  }
};

module.exports = sendEmail;
