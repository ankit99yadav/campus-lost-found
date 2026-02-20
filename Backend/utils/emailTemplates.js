const { sendEmail } = require('../config/nodemailer');

const getOTPEmailTemplate = (name, otp, type) => {
  const actionText = type === 'email' ? 'verify your email' : 'reset your password';
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Campus Lost & Found - OTP</title>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 20px; }
      .container { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 36px; text-align: center; }
      .header h1 { color: #fff; margin: 0; font-size: 24px; font-weight: 700; }
      .header p { color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px; }
      .body { padding: 32px; }
      .greeting { font-size: 17px; color: #1e293b; font-weight: 600; margin-bottom: 12px; }
      .text { color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
      .otp-box { background: linear-gradient(135deg, #f1f5f9, #e2e8f0); border: 2px dashed #6366f1; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
      .otp-label { font-size: 12px; color: #6366f1; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
      .otp-code { font-size: 42px; font-weight: 800; color: #4f46e5; letter-spacing: 10px; }
      .expire { font-size: 12px; color: #94a3b8; margin-top: 8px; }
      .warning { background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 12px 16px; font-size: 13px; color: #92400e; margin: 20px 0; }
      .footer { background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
      .footer p { font-size: 12px; color: #94a3b8; margin: 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎓 Campus Lost & Found</h1>
        <p>Helping you find what matters</p>
      </div>
      <div class="body">
        <div class="greeting">Hello, ${name}! 👋</div>
        <p class="text">You've requested to ${actionText}. Use the OTP below to complete the process.</p>
        <div class="otp-box">
          <div class="otp-label">Your One-Time Password</div>
          <div class="otp-code">${otp}</div>
          <div class="expire">⏱ Expires in ${process.env.OTP_EXPIRE_MINUTES || 10} minutes</div>
        </div>
        <div class="warning">
          ⚠️ Never share this OTP with anyone. Our team will never ask for your OTP.
          If you didn't request this, please ignore this email.
        </div>
      </div>
      <div class="footer">
        <p>© 2024 Campus Lost & Found • All rights reserved</p>
      </div>
    </div>
  </body>
  </html>`;
};

const getItemMatchEmailTemplate = (userName, lostItem, foundItem) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 20px; }
      .container { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
      .header { background: linear-gradient(135deg, #10b981, #059669); padding: 36px; text-align: center; }
      .header h1 { color: #fff; margin: 0; font-size: 22px; }
      .body { padding: 32px; }
      .match-badge { display: inline-block; background: #d1fae5; color: #065f46; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 100px; margin-bottom: 20px; }
      .item-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 12px 0; }
      .item-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6366f1; margin-bottom: 6px; }
      .item-title { font-size: 16px; font-weight: 700; color: #1e293b; }
      .item-desc { font-size: 13px; color: #64748b; margin-top: 4px; }
      .cta { text-align: center; margin: 28px 0; }
      .btn { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; }
      .footer { background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0; }
      .footer p { font-size: 12px; color: #94a3b8; margin: 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🎉 Possible Match Found!</h1>
      </div>
      <div class="body">
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Great news! We found a possible match for your lost item. Check it out:</p>
        <span class="match-badge">🔍 Possible Match</span>
        <div class="item-card">
          <div class="item-label">Your Lost Item</div>
          <div class="item-title">${lostItem.title}</div>
          <div class="item-desc">${lostItem.category} • Lost on ${new Date(lostItem.dateLostFound).toDateString()}</div>
        </div>
        <div class="item-card">
          <div class="item-label">Found Item (Possible Match)</div>
          <div class="item-title">${foundItem.title}</div>
          <div class="item-desc">${foundItem.category} • Found on ${new Date(foundItem.dateLostFound).toDateString()}</div>
        </div>
        <div class="cta">
          <a href="${process.env.CLIENT_URL}/items/${foundItem._id}" class="btn">View Match →</a>
        </div>
      </div>
      <div class="footer"><p>© 2024 Campus Lost & Found</p></div>
    </div>
  </body>
  </html>`;
};

const sendOTPEmail = async (user, otp, type = 'email') => {
  const subject = type === 'email'
    ? '🔐 Verify Your Email - Campus Lost & Found'
    : '🔑 Password Reset OTP - Campus Lost & Found';
  return sendEmail({
    to: user.email,
    subject,
    html: getOTPEmailTemplate(user.name, otp, type),
  });
};

const sendMatchNotificationEmail = async (user, lostItem, foundItem) => {
  return sendEmail({
    to: user.email,
    subject: '🎉 Possible Match Found for Your Lost Item!',
    html: getItemMatchEmailTemplate(user.name, lostItem, foundItem),
  });
};

module.exports = { sendOTPEmail, sendMatchNotificationEmail };
