import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendPasswordResetEmail = async (email, resetCode) => {
  const mailOptions = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: 'Your password reset code',
    text: `Your password reset code is: ${resetCode}\n\nThis code is valid for 10 minutes.`
  };

  return transporter.sendMail(mailOptions);
};

// You can add other email functions here later
// export const sendWelcomeEmail = ...
// export const sendNotificationEmail = ...