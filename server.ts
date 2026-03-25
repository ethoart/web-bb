import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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

// Models
const RegistrationSchema = new mongoose.Schema({
  teamName: String,
  robotName: String,
  country: String,
  captainName: String,
  email: String,
  phone: String,
  password: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  participated: { type: Boolean, default: false },
  qrCode: String,
  createdAt: { type: Date, default: Date.now }
});
const Registration = mongoose.model('Registration', RegistrationSchema);

const SettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true },
  value: mongoose.Schema.Types.Mixed
});
const Settings = mongoose.model('Settings', SettingsSchema);

// In-memory mock data
const mockRegistrations: any[] = [];
let mockSettings: any = {
  prizePoolFirst: '$500,000',
  isRevealed: false,
  sponsors: '',
  facebookLink: 'https://www.facebook.com/profile.php?id=61573020699132',
  instagramLink: '#',
  youtubeLink: '#'
};

// API Routes
app.post('/api/register', async (req, res) => {
  try {
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
      try {
        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER;
        const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER;
        
        const htmlContent = `
          <p>A new team has registered for Bot Bash!</p>
          <ul>
            <li><strong>Team Name:</strong> ${req.body.teamName}</li>
            <li><strong>Robot Name:</strong> ${req.body.robotName}</li>
            <li><strong>Country:</strong> ${req.body.country}</li>
            <li><strong>Captain:</strong> ${req.body.captainName}</li>
            <li><strong>Email:</strong> ${req.body.email}</li>
          </ul>
          <p>Please check the admin dashboard to approve or reject this registration.</p>
        `;

        await transporter.sendMail({
          from: `"Bot Bash" <${fromEmail}>`,
          to: adminEmail, // Admin email
          subject: `New Bot Bash Registration: ${req.body.teamName}`,
          html: getEmailTemplate(`New Registration`, htmlContent)
        });
      } catch (e) {
        console.error('Failed to send admin notification email', e);
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
          htmlContent += `<p>Congratulations! Attached is your QR Code pass for the event. Please present this at the entrance.</p>`;
          mailOptions.attachments = [{
            filename: 'botbash-pass.png',
            content: user.qrCode.split("base64,")[1],
            encoding: 'base64'
          }];
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
