import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import multer from 'multer';
import fs from 'fs';
import PDFDocument from 'pdfkit';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static(uploadDir));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
let isDbConnected = false;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
    isDbConnected = true;
  }).catch(err => {
    console.error('MongoDB connection error:', err);
  });
} else {
  console.log('No MONGODB_URI provided. Using in-memory mock for preview.');
}

// Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT || '587') === 465,
  auth: {
    user: process.env.SMTP_USER || process.env.GMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.GMAIL_PASS,
  },
});

const getEmailTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      background-color: #0A0A0A;
      color: #FFFFFF;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #111111;
      border: 2px solid #333333;
      border-top: 4px solid #E427F5;
    }
    .header {
      padding: 30px;
      text-align: center;
      background-color: #0A0A0A;
      border-bottom: 2px solid #333333;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 900;
      font-style: italic;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #FFFFFF;
    }
    .header h1 span {
      color: #E427F5;
    }
    .content {
      padding: 30px;
      font-size: 16px;
      line-height: 1.6;
      color: #E0E0E0;
    }
    .content h2 {
      color: #E427F5;
      font-size: 24px;
      font-weight: 700;
      font-style: italic;
      text-transform: uppercase;
      margin-top: 0;
    }
    .footer {
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666666;
      background-color: #0A0A0A;
      border-top: 2px solid #333333;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .btn {
      display: inline-block;
      background-color: #E427F5;
      color: #000000;
      padding: 12px 24px;
      text-decoration: none;
      font-weight: 900;
      font-style: italic;
      text-transform: uppercase;
      margin-top: 20px;
    }
    .pass-card {
      background: #000;
      border: 2px solid #E427F5;
      border-radius: 12px;
      padding: 24px;
      margin: 30px auto;
      text-align: center;
      max-width: 350px;
      box-shadow: 0 0 20px rgba(228, 39, 245, 0.2);
    }
    .pass-card h3 {
      color: #E427F5;
      margin: 0 0 5px 0;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-size: 24px;
    }
    .pass-card .subtitle {
      color: #fff;
      font-size: 16px;
      font-weight: bold;
      margin: 0 0 20px 0;
    }
    .qr-container {
      background: #fff;
      padding: 15px;
      border-radius: 8px;
      display: inline-block;
      margin-bottom: 20px;
    }
    .qr-container img {
      display: block;
      width: 200px;
      height: 200px;
    }
    .pass-details {
      text-align: left;
      border-top: 1px dashed #333;
      padding-top: 15px;
      margin-top: 15px;
    }
    .pass-details p {
      margin: 5px 0;
      font-size: 14px;
      color: #ccc;
    }
    .pass-details strong {
      color: #fff;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>BOT <span>BASH</span></h1>
    </div>
    <div class="content">
      <h2>${title}</h2>
      ${content}
    </div>
    <div class="footer">
      &copy; 2026 BOT BASH. ALL RIGHTS RESERVED.<br>
      Tech to Oxygen
    </div>
  </div>
</body>
</html>
`;

const generateTermsPDF = (teamName: string, captainName: string, termsText: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      doc.fontSize(24).fillColor('#E427F5').text('BOT BASH 2026', { align: 'center' });
      doc.moveDown();
      doc.fontSize(18).fillColor('#000000').text('Terms and Conditions Agreement', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Team Name: ${teamName}`);
      doc.text(`Captain Name: ${captainName}`);
      doc.text(`Date Agreed: ${new Date().toLocaleDateString()}`);
      doc.moveDown();
      doc.moveDown();
      doc.fontSize(10).text(termsText || 'Standard Bot Bash Terms and Conditions apply.', {
        align: 'justify'
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// Models
const RegistrationSchema = new mongoose.Schema({
  teamName: String,
  robotName: String,
  country: String,
  captainName: String,
  email: { type: String, unique: true },
  phone: String,
  memberCount: { type: Number, default: 1 },
  password: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  robotHeight: String,
  robotWeight: String,
  robotMaterials: String,
  robotDimensions: String,
  robotPowerSource: String,
  robotWeapons: String,
  robotAdditionalInfo: String,
  robotImage: String,
  robotStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  participated: { type: Boolean, default: false },
  qrCode: String,
  resetCode: String,
  resetCodeExpires: Date,
  createdAt: { type: Date, default: Date.now }
});
const Registration = mongoose.model('Registration', RegistrationSchema);

const SettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed
});
const Settings = mongoose.model('Settings', SettingsSchema);

const GalleryItemSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['upload', 'link'], required: true },
  mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
  createdAt: { type: Date, default: Date.now }
});
const GalleryItem = mongoose.model('GalleryItem', GalleryItemSchema);

// In-memory mock data
const mockRegistrations: any[] = [];
let mockGalleryItems: any[] = [];
let mockSettings: any = {
  prizePoolFirst: '$500,000',
  isRevealed: false,
  bannerImage: 'https://github.com/ethoart/botbash-img/blob/main/Adobe%20Express%20-%20file.png?raw=true',
  bannerText: 'COMING SOON',
  sponsors: [],
  facebookLink: 'https://www.facebook.com/profile.php?id=61573020699132',
  instagramLink: '#',
  youtubeLink: '#',
  eventDate: 'To Be Announced (2026)',
  eventLocation: 'Royal MAS Arena, Colombo',
  logoSize: '14',
  termsAndConditions: 'By registering for BOT BASH, you agree to follow all safety protocols and competition rules. Robots must be inspected before the match. The organizers are not responsible for any damage to your robot during the competition.'
};

// API Routes
app.post('/api/admin/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    res.json({ success: true, url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/gallery', async (req, res) => {
  try {
    if (isDbConnected) {
      const items = await GalleryItem.find().sort({ createdAt: -1 });
      res.json(items);
    } else {
      res.json(mockGalleryItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/gallery/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const { mediaType = 'image' } = req.body;
    const url = `/uploads/${req.file.filename}`;
    let newItem;
    if (isDbConnected) {
      newItem = new GalleryItem({ url, type: 'upload', mediaType });
      await newItem.save();
    } else {
      newItem = { _id: Date.now().toString(), url, type: 'upload', mediaType, createdAt: new Date() };
      mockGalleryItems.push(newItem);
    }
    res.json({ success: true, image: newItem });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/gallery/link', async (req, res) => {
  try {
    const { url, mediaType = 'image' } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    
    let newItem;
    if (isDbConnected) {
      newItem = new GalleryItem({ url, type: 'link', mediaType });
      await newItem.save();
    } else {
      newItem = { _id: Date.now().toString(), url, type: 'link', mediaType, createdAt: new Date() };
      mockGalleryItems.push(newItem);
    }
    res.json({ success: true, image: newItem });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/gallery/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let item;
    
    if (isDbConnected) {
      item = await GalleryItem.findById(id);
      if (!item) return res.status(404).json({ error: 'Item not found' });
      
      if (item.type === 'upload') {
        const filePath = path.join(process.cwd(), item.url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      await GalleryItem.findByIdAndDelete(id);
    } else {
      const index = mockGalleryItems.findIndex(img => img._id === id);
      if (index === -1) return res.status(404).json({ error: 'Item not found' });
      
      item = mockGalleryItems[index];
      if (item.type === 'upload') {
        const filePath = path.join(process.cwd(), item.url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      mockGalleryItems.splice(index, 1);
    }
    
    res.json({ success: true, message: 'Item deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/registrations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected) {
      await Registration.findByIdAndDelete(id);
    } else {
      const index = mockRegistrations.findIndex(r => r._id === id);
      if (index !== -1) mockRegistrations.splice(index, 1);
    }
    res.json({ success: true, message: 'Registration deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if email already exists
    if (isDbConnected) {
      const existing = await Registration.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    } else {
      const existing = mockRegistrations.find(r => r.email === email);
      if (existing) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    let newReg;
    if (isDbConnected) {
      newReg = new Registration(req.body);
      await newReg.save();
    } else {
      newReg = { ...req.body, _id: Date.now().toString(), status: 'pending', participated: false, createdAt: new Date() };
      mockRegistrations.push(newReg);
    }

    // Send Admin Notification
    if (process.env.SMTP_USER || process.env.GMAIL_USER) {
      const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER;
      
      try {
        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER;
        
        const adminHtml = `
          <p>A new team has registered for Bot Bash!</p>
          <ul>
            <li><strong>Team Name:</strong> ${req.body.teamName}</li>
            <li><strong>Robot Name:</strong> ${req.body.robotName}</li>
            <li><strong>Member Count:</strong> ${req.body.memberCount || 1}</li>
            <li><strong>Country:</strong> ${req.body.country}</li>
            <li><strong>Captain:</strong> ${req.body.captainName}</li>
            <li><strong>Email:</strong> ${req.body.email}</li>
          </ul>
          <p>Please check the admin dashboard to approve or reject this registration.</p>
        `;

        await transporter.sendMail({
          from: `"Bot Bash" <${fromEmail}>`,
          to: adminEmail,
          subject: `New Bot Bash Registration: ${req.body.teamName}`,
          html: getEmailTemplate(`New Registration`, adminHtml)
        });
      } catch (e) {
        console.error('Failed to send admin notification email', e);
      }

      // Send User Confirmation
      try {
        const userHtml = `
          <p>Hello <strong>${req.body.captainName}</strong>,</p>
          <p>Thank you for registering your team <strong>${req.body.teamName}</strong> for Bot Bash 2026!</p>
          <p>Our team will review your application shortly. You will receive another email once your status has been updated.</p>
          <p>Best regards,<br>The Bot Bash Team</p>
        `;

        await transporter.sendMail({
          from: `"Bot Bash" <${fromEmail}>`,
          to: req.body.email,
          subject: `Registration Received: ${req.body.teamName}`,
          html: getEmailTemplate(`Registration Received`, userHtml)
        });
      } catch (e) {
        console.error('Failed to send user confirmation email', e);
      }
    }

    res.json({ success: true, message: 'Registration successful!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    let user;
    if (isDbConnected) {
      user = await Registration.findOne({ email, password });
    } else {
      user = mockRegistrations.find(r => r.email === email && r.password === password);
    }
    
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let user;
    if (isDbConnected) {
      user = await Registration.findById(id);
    } else {
      user = mockRegistrations.find(r => r._id === id);
    }
    
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    let user;
    if (isDbConnected) {
      user = await Registration.findOne({ email });
    } else {
      user = mockRegistrations.find(r => r.email === email);
    }

    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    if (isDbConnected) {
      user.resetCode = resetCode;
      user.resetCodeExpires = expires;
      await user.save();
    } else {
      user.resetCode = resetCode;
      user.resetCodeExpires = expires;
    }

    // Send Email
    if (process.env.SMTP_USER || process.env.GMAIL_USER) {
      const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER;
      const html = `
        <p>Hello <strong>${user.captainName}</strong>,</p>
        <p>You requested a password reset for your Bot Bash account.</p>
        <p>Your verification code is:</p>
        <div style="background: #222; padding: 20px; text-align: center; font-size: 32px; font-weight: 900; color: #E427F5; letter-spacing: 5px; margin: 20px 0;">
          ${resetCode}
        </div>
        <p>This code will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      `;

      await transporter.sendMail({
        from: `"Bot Bash" <${fromEmail}>`,
        to: user.email,
        subject: `Password Reset Verification Code`,
        html: getEmailTemplate(`Password Reset`, html)
      });
    } else {
      console.log('Mock Reset Code for', email, ':', resetCode);
    }

    res.json({ success: true, message: 'Verification code sent to email' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    let user;
    if (isDbConnected) {
      user = await Registration.findOne({ 
        email, 
        resetCode: code,
        resetCodeExpires: { $gt: new Date() }
      });
    } else {
      user = mockRegistrations.find(r => 
        r.email === email && 
        r.resetCode === code && 
        r.resetCodeExpires > new Date()
      );
    }

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    if (isDbConnected) {
      user.password = newPassword;
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
      await user.save();
    } else {
      user.password = newPassword;
      user.resetCode = undefined;
      user.resetCodeExpires = undefined;
    }

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/profile/robot', upload.single('image'), async (req, res) => {
  try {
    const { userId, robotHeight, robotWeight, robotMaterials, robotDimensions, robotPowerSource, robotWeapons, robotAdditionalInfo } = req.body;
    let user;

    if (isDbConnected) {
      user = await Registration.findById(userId);
    } else {
      user = mockRegistrations.find(r => r._id === userId);
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    user.robotHeight = robotHeight;
    user.robotWeight = robotWeight;
    user.robotMaterials = robotMaterials;
    user.robotDimensions = robotDimensions;
    user.robotPowerSource = robotPowerSource;
    user.robotWeapons = robotWeapons;
    user.robotAdditionalInfo = robotAdditionalInfo;
    user.robotStatus = 'pending'; // Reset to pending when updated

    if (req.file) {
      user.robotImage = `/uploads/${req.file.filename}`;
    }

    if (isDbConnected) {
      await user.save();
    }

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/registrations/:id/robot-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    let user;

    if (isDbConnected) {
      user = await Registration.findById(id);
    } else {
      user = mockRegistrations.find(r => r._id === id);
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    user.robotStatus = status;

    if (isDbConnected) {
      await user.save();
    }

    // Send Email to User about Robot Status
    if (process.env.SMTP_USER || process.env.GMAIL_USER) {
      try {
        const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER;
        let mailOptions: any = {
          from: `"Bot Bash" <${fromEmail}>`,
          to: user.email,
          subject: `Robot Registration ${status.toUpperCase()}`,
          html: getEmailTemplate(`Robot Registration ${status.toUpperCase()}`, `
            <p>Hello <strong>${user.captainName}</strong>,</p>
            <p>Your robot registration for team <strong>${user.teamName}</strong> has been <strong>${status}</strong>.</p>
            <p>Please check your profile for more details.</p>
          `)
        };
        await transporter.sendMail(mailOptions);
      } catch (e) {
        console.error('Failed to send robot status email', e);
      }
    }

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/registrations', async (req, res) => {
  try {
    if (isDbConnected) {
      const regs = await Registration.find().sort({ createdAt: -1 });
      res.json(regs);
    } else {
      res.json(mockRegistrations.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/registrations/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    let user;

    if (isDbConnected) {
      user = await Registration.findById(id);
    } else {
      user = mockRegistrations.find(r => r._id === id);
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    user.status = status;

    if (status === 'approved' && !user.qrCode) {
      // Generate QR Code
      const qrData = JSON.stringify({ id: user._id, team: user.teamName });
      user.qrCode = await QRCode.toDataURL(qrData);
    }

    if (isDbConnected) {
      await user.save();
    }

    // Send Email to User
    if (process.env.SMTP_USER || process.env.GMAIL_USER) {
      try {
        const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER;
        let mailOptions: any = {
          from: `"Bot Bash" <${fromEmail}>`,
          to: user.email,
          subject: `Bot Bash 2026 Application ${status.toUpperCase()}`,
        };

        let htmlContent = `<p>Hello <strong>${user.captainName}</strong>,</p>
                           <p>Your application for team <strong>${user.teamName}</strong> has been <strong>${status}</strong>.</p>`;

        if (status === 'approved') {
          let termsText = mockSettings.termsAndConditions;
          if (isDbConnected) {
            const settings = await Settings.findOne();
            if (settings && settings.termsAndConditions) {
              termsText = settings.termsAndConditions;
            }
          }

          const pdfBuffer = await generateTermsPDF(user.teamName, user.captainName, termsText);

          htmlContent += `
            <div class="pass-card">
              <h3>Bot Bash</h3>
              <p class="subtitle">2026 Event Pass</p>
              
              <div class="qr-container">
                <img src="cid:qrcode" alt="QR Code" />
              </div>
              
              <div class="pass-details">
                <p>Team: <strong>${user.teamName}</strong></p>
                <p>Captain: <strong>${user.captainName}</strong></p>
                <p>Robot: <strong>${user.robotName}</strong></p>
              </div>
            </div>
            <p>Congratulations! Attached is your QR Code pass for the event and the Terms and Conditions PDF you agreed to. Please present this pass at the entrance.</p>
          `;
          
          mailOptions.attachments = [
            {
              filename: 'botbash-pass.png',
              content: user.qrCode.split("base64,")[1],
              encoding: 'base64',
              cid: 'qrcode'
            },
            {
              filename: 'BotBash_Terms_And_Conditions.pdf',
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ];
        } else if (status === 'rejected') {
          htmlContent += `<p>Unfortunately, your application was not approved at this time. Thank you for your interest in Bot Bash.</p>`;
        }

        mailOptions.html = getEmailTemplate(`Application ${status.toUpperCase()}`, htmlContent);

        await transporter.sendMail(mailOptions);
      } catch (e) {
        console.error('Failed to send status email', e);
      }
    }

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/scan', async (req, res) => {
  try {
    const { id } = req.body;
    let user;

    if (isDbConnected) {
      user = await Registration.findById(id);
    } else {
      user = mockRegistrations.find(r => r._id === id);
    }

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.status !== 'approved') return res.status(400).json({ error: 'User is not approved' });

    user.participated = true;

    if (isDbConnected) {
      await user.save();
    }

    // Send Thank You Email
    if (process.env.SMTP_USER || process.env.GMAIL_USER) {
      try {
        const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER;
        const thankYouHtml = `
          <p>Hello <strong>${user.captainName}</strong>,</p>
          <p>Thank you for attending Bot Bash 2026 with your team <strong>${user.teamName}</strong>!</p>
          <p>We hope you had an amazing experience. Stay tuned for results and future events!</p>
          <p>Best regards,<br>The Bot Bash Team</p>
        `;

        await transporter.sendMail({
          from: `"Bot Bash" <${fromEmail}>`,
          to: user.email,
          subject: `Thank You for Attending Bot Bash 2026!`,
          html: getEmailTemplate(`Thank You for Attending`, thankYouHtml)
        });
      } catch (e) {
        console.error('Failed to send thank you email', e);
      }
    }

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/mail', async (req, res) => {
  try {
    const { subject, message, target } = req.body; // target could be 'all', 'approved', 'pending'
    
    let users = [];
    if (isDbConnected) {
      users = await Registration.find(target === 'all' ? {} : { status: target });
    } else {
      users = mockRegistrations.filter(r => target === 'all' || r.status === target);
    }

    if (process.env.SMTP_USER || process.env.GMAIL_USER) {
      const emails = users.map(u => u.email).filter(Boolean);
      if (emails.length > 0) {
        const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER;
        
        // Convert plain text message to simple HTML paragraphs
        const formattedMessage = (req.body.text || message || '').split('\n').map((line: string) => `<p>${line}</p>`).join('');
        
        await transporter.sendMail({
          from: `"Bot Bash" <${fromEmail}>`,
          bcc: emails,
          subject: subject,
          html: getEmailTemplate(subject, formattedMessage)
        });
      }
    } else {
      console.log('Mock email sent to:', users.length, 'users');
    }

    res.json({ success: true, count: users.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/settings', async (req, res) => {
  try {
    if (isDbConnected) {
      const settings = await Settings.find();
      const settingsMap = settings.reduce((acc: any, s) => ({ ...acc, [s.key]: s.value }), {});
      res.json(settingsMap);
    } else {
      res.json(mockSettings);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/settings', async (req, res) => {
  try {
    const { key, value } = req.body;
    if (isDbConnected) {
      await Settings.findOneAndUpdate({ key }, { value }, { upsert: true });
    } else {
      mockSettings[key] = value;
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/sitemap.xml', (req, res) => {
  const baseUrl = 'https://ais-pre-zxdeh3hmb46eheoj3tzas4-181219863575.asia-east1.run.app';
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/profile</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>`;
  res.header('Content-Type', 'application/xml');
  res.send(sitemap);
});

async function startServer() {
  const PORT = 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
