import transporter from "../config/nodemailer.js";

const sendOTPEmail = async (email, otp, type = 'register') => {
  const subject = `${type === 'register'? 'Verify Your Email' : 'Reset Your Password'} - One-Time Password (OTP)`;

  const heading =
    type === 'register'
      ? 'Welcome to <span style="color: #8e8200;">Quirky-Threads</span>!'
      : 'Password Reset Request';

  const message =
    type === 'register'
      ? `Thank you for registering with <strong>Quirky-Threads Online</strong>. To complete your sign-up process, please verify your email address by entering the OTP below:`
      : `You’ve requested to reset your password for your <strong>Quirky-Threads</strong> account. Use the OTP below to proceed with resetting your password:`;

  const ignoreNote =
    type === 'register'
      ? `If you did not request this registration, please ignore this email.`
      : `If you did not request a password reset, you can safely ignore this email.`;

  const mailOptions = {
    from: `"Quirky-Threads Online" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 20px; color: #333;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="text-align: center; color: #2b2d42;">${heading}</h2>
          <p>Hello there,</p>
          <p>${message}</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; padding: 15px 30px; font-size: 24px; letter-spacing: 5px; font-weight: bold; color: #ffffff; background:#141e73; border-radius: 8px;">
              ${otp}
            </span>
          </div>
          <p>This OTP is valid for the next <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p>${ignoreNote} No changes will be made to your account.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 14px; color: #888888;">Regards,<br><strong>Quirky-Threads Team</strong></p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const sendNewPasswordEmail = async (email, newPassword) => {
  const mailOptions = {
    from: `"Quirky-Threads Online" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your New Password - Quirky-Threads Online',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <h2 style="text-align: center; color: #2b2d42;">Your Password Has Been Reset</h2>
          <p>Hello,</p>
          <p>Your password has been successfully reset by our system. Below is your new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; padding: 12px 24px; background-color: #800000; color: #fff; font-size: 20px; font-weight: bold; border-radius: 6px;">
              ${newPassword}
            </span>
          </div>
          <p>We recommend you <a href="https://quirky-threads.onrender.com/login">log in</a> using this password and change it immediately from your profile settings for security purposes.</p>
          <p>If you did not request this change, please contact our support team immediately.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 14px; color: #888;">Best regards,<br><strong>Quirky-Threads Team</strong></p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export { sendOTPEmail, sendNewPasswordEmail }