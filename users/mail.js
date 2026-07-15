// src/utils/emailUtils.js
// À implémenter si besoin d'envoi d'emails (bienvenue, reset password, etc.)
const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Event Market" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Bienvenue sur Event Market !',
      html: `
        <h1>Bienvenue ${name} !</h1>
        <p>Merci de vous être inscrit sur Event Market.</p>
        <p>Vous pouvez dès maintenant découvrir nos services.</p>
      `
    });
  } catch (error) {
    console.error('Email error:', error);
  }
};

module.exports = { sendWelcomeEmail };