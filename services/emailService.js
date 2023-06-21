const nodemailer = require('nodemailer');
const emailConfig = require('../config/email');

// Create a transporter with the email configuration
const transporter = nodemailer.createTransport(emailConfig);

require('dotenv').config();
// Function to send a cart details email
const sendCartDetailsEmail = async (toEmail, cart) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: toEmail,
      subject: 'Order Confirmation - Cart Details',
      html: `<h1>Your Cart Details</h1><p>${JSON.stringify(cart)}</p>`,
    };

    // Send the email using the transporter
    await transporter.sendMail(mailOptions);

    console.log('Cart details email sent successfully');
  } catch (error) {
    console.error('Error sending cart details email:', error);
  }
};

module.exports = {
  sendCartDetailsEmail,
};
