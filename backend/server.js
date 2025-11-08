// ===============================
// ✅ IMPORTS & CONFIG
// ===============================
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Contact = require('./models/Contact');

dotenv.config();
const app = express();

// ===============================
// ✅ MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// ✅ MONGO CONNECTION
// ===============================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ DB connection failed:', err));

// ===============================
// ✅ NODEMAILER (GoDaddy SMTP)
// ===============================
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true, // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ===============================
// ✅ ROUTE 1: Save to DB only (for index.html)
// ===============================
app.post('/api/contact/save', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    console.log('✅ Contact saved to MongoDB only');
    res.status(201).json({ message: 'Saved to database successfully!' });
  } catch (err) {
    console.error('❌ Error saving to DB:', err);
    res.status(500).json({ message: 'Failed to save to DB', error: err.message });
  }
});

// ===============================
// ✅ ROUTE 2: Send Email only (for consultant.html)
// ===============================
app.post('/api/contact/email', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const mailOptions = {
      from: `"Pixorah Website" <${process.env.EMAIL_USER}>`,
      to: 'info@pixorah.com',
      subject: `New Design Consultation from ${name}`,
      html: `
        <h2>New Consultation Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong> ${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (err) {
    console.error('❌ Error sending email:', err);
    res.status(500).json({ message: 'Failed to send email', error: err.message });
  }
});

// ===============================
// ✅ SERVER LISTEN
// ===============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
