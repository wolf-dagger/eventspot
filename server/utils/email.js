const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const senderEmail = process.env.EMAIL_USER || process.env.EMAIL;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (email, otp, type) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error(
      "Email configuration is missing. Please set EMAIL_USER and EMAIL_PASS in the server .env file.",
    );
    return false;
  }

  try {
    const title =
      type === "account_verification"
        ? "Account Verification"
        : "Event Booking";
    const msg = type === "account_verification" ? "account" : "event booking";

    const mailOptions = {
      from: senderEmail,
      to: email,
      subject: title,
      text: `Your OTP for ${type} is ${otp}. It is valid for 5 minutes. Do not share it with anyone.`,
      html: `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: Arial, Helvetica, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; padding: 20px;">

          <div style="background: linear-gradient(135deg, #2563eb, #4f46e5); padding: 30px 20px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">
              Verify Your Email
            </h1>
            <p style="color: #dbeafe; margin: 10px 0 0; font-size: 14px;">
              ${msg}
            </p>
          </div>

          <div style="background-color: #ffffff; padding: 35px 25px; border-radius: 0 0 16px 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.06);">
            <h2 style="color: #0f172a; font-size: 21px; margin-top: 0;">
              Hello!
            </h2>

            <p style="color: #475569; font-size: 15px; line-height: 1.7;">
              We received a request to verify your account. Use the
              verification code below to complete your
              <strong>${type}</strong>.
            </p>

            <div style="background-color: #eff6ff; border: 1px dashed #60a5fa; border-radius: 12px; padding: 22px 15px; text-align: center; margin: 28px 0;">
              <p style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px;">
                Your verification code
              </p>
              <div style="font-size: 34px; font-weight: bold; letter-spacing: 10px; color: #1d4ed8;">
                ${otp}
              </div>
            </div>

            <p style="color: #475569; font-size: 14px; line-height: 1.7;">
              ⏱️ This code is valid for <strong>5 minutes</strong>.
              Please enter it before it expires.
            </p>

            <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 14px; margin-top: 22px; border-radius: 4px;">
              <p style="color: #9a3412; font-size: 13px; line-height: 1.6; margin: 0;">
                <strong>Security tip:</strong> Never share this OTP
                with anyone. Our team will never ask you for this code.
              </p>
            </div>

            <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin-top: 25px;">
              If you didn't request this verification, you can safely
              ignore this email.
            </p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 20px;" />

            <p style="color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.6; margin-bottom: 0;">
              This is an automated message. Please do not reply to this email.
              <br />
              &copy; ${new Date().getFullYear()} Your App. All rights reserved.
            </p>
          </div>

        </div>
      </body>
    </html>
  `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email} for ${type}`);
    return true;
  } catch (error) {
    console.log(`Error sending OTP to ${email} for ${type}: ${error.message}`);
    return false;
  }
};

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error(
      "Email configuration is missing. Please set EMAIL_USER and EMAIL_PASS in the server .env file.",
    );
    return false;
  }

  try {
    const mailOptions = {
      from: senderEmail,
      to: userEmail,
      subject: `Event Booking Confirmation for ${eventTitle}`,
      html: `
        <html>
          <head>
            <style>
              body {
                margin: 0;
                padding: 0;
                background-color: #f1f5f9;
                font-family: Arial, Helvetica, sans-serif;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
              .header {
                background-color: #0f172a;
                color: #ffffff;
                padding: 20px;
                border-radius: 8px 8px 0 0;
              }
              .content {
                padding: 20px;
              }
              .footer {
                background-color: #0f172a;
                color: #ffffff;
                padding: 20px;
                border-radius: 0 0 8px 8px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Event Booking Confirmation</h1>
              </div>
              <div class="content">
                <p>Dear ${userName},</p>
                <p>Thank you for booking the event "${eventTitle}". We look forward to seeing you there.</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Your App. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Booking email sent to ${userEmail}`);
    return true;
  } catch (error) {
    console.log(
      `Error sending booking email to ${userEmail}: ${error.message}`,
    );
    return false;
  }
};

module.exports = { sendOtpEmail, sendBookingEmail };
