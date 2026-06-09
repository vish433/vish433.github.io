const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
app.use(express.static(path.join(__dirname)));

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please provide name, email, and message.' });
  }

  const transportConfig = process.env.EMAIL_HOST
    ? {
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT || 465),
        secure: process.env.EMAIL_SECURE !== 'false',
      }
    : {
        service: 'gmail',
      };

  const transporter = nodemailer.createTransport({
    ...transportConfig,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(500).json({ error: 'Email server is not configured. Set EMAIL_USER and EMAIL_PASS.' });
  }

  const mailOptions = {
    from: `Dhanshika's Craft Studio <${process.env.EMAIL_USER}>`,
    to: 'globaltraveldairies@gmail.com',
    replyTo: email,
    subject: `New craft request from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({ success: true });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Unable to send email. Check server settings.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
