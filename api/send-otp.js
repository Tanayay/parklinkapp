import nodemailer from 'nodemailer';

function isEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, code, name } = req.body || {};

    if (!isEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }

    if (!/^\d{6}$/.test(String(code || ''))) {
      return res.status(400).json({ error: 'Valid 6 digit code is required.' });
    }

    const emailUser = process.env.PARKLINK_EMAIL_USER;
    const emailPass = process.env.PARKLINK_EMAIL_PASS;

    if (!emailUser || !emailPass) {
      return res.status(500).json({ error: 'ParkLink email sender is not configured.' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    await transporter.sendMail({
      from: `ParkLink <${emailUser}>`,
      to: email,
      subject: 'Your ParkLink verification code',
      text: `Your ParkLink verification code is ${code}. It expires soon.`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.5"><h2>ParkLink Verification</h2><p>Hi ${name || 'there'},</p><p>Your verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p><p>This code expires soon. If you did not request it, you can ignore this email.</p></div>`
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not send OTP email.' });
  }
}
