import nodemailer from 'nodemailer';

function isEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function buildEmail({ type = 'otp', code, name, spotName }) {
  if (type === 'parking') {
    return {
      subject: 'Your ParkLink parking spot code',
      text: `Your ParkLink parking code for ${spotName || 'your reserved spot'} is ${code}. Enter this once you arrive at the spot.`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.5"><h2>ParkLink Parking OTP</h2><p>Hi ${name || 'there'},</p><p>Your parking code for <strong>${spotName || 'your reserved spot'}</strong> is:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p><p>Enter this in ParkLink when you arrive.</p></div>`
    };
  }

  if (type === 'parked') {
    return {
      subject: 'Thanks for parking with ParkLink',
      text: `Thanks for parking with ParkLink. Your spot ${spotName || ''} is now marked occupied.`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.5"><h2>Thanks for parking with ParkLink</h2><p>Hi ${name || 'there'},</p><p>Your spot <strong>${spotName || 'your ParkLink spot'}</strong> is now marked as occupied.</p><p>We’ll keep it held until you leave or the hold expires.</p></div>`
    };
  }

  if (type === 'left') {
    return {
      subject: 'Your ParkLink spot has been released',
      text: `You have left ${spotName || 'your ParkLink spot'}. The spot is now available again.`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.5"><h2>You left your ParkLink spot</h2><p>Hi ${name || 'there'},</p><p>Your spot <strong>${spotName || 'your ParkLink spot'}</strong> has been released and is available again.</p><p>Thanks for using ParkLink.</p></div>`
    };
  }

  return {
    subject: 'Your ParkLink verification code',
    text: `Your ParkLink verification code is ${code}. It expires soon.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.5"><h2>ParkLink Verification</h2><p>Hi ${name || 'there'},</p><p>Your verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px">${code}</p><p>This code expires soon. If you did not request it, you can ignore this email.</p></div>`
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, code, name, type = 'otp', spotName } = req.body || {};

    if (!isEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required.' });
    }

    if ((type === 'otp' || type === 'login' || type === 'parking') && !/^\d{6}$/.test(String(code || ''))) {
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

    const emailContent = buildEmail({ type, code, name, spotName });

    await transporter.sendMail({
      from: `ParkLink <${emailUser}>`,
      to: email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Could not send OTP email.' });
  }
}
