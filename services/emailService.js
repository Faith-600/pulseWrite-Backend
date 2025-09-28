const nodemailer = require("nodemailer");

// The core of the service is the "transporter" object
// It's configured once with your SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a verification email to a user.
 * @param {string} to - The recipient's email address.
 * @param {string} code - The 4-digit verification code.
 */
const sendVerificationEmail = async (to, code) => {
  console.log(`Sending verification email to ${to} with code ${code}`);

  const mailOptions = {
    from: '"PulseWrite" <noreply@pulsewrite.com>', // sender address
    to: to, // list of receivers
    subject: "Your PulseWrite Verification Code", // Subject line
    html: `
            <div style="font-family: sans-serif; text-align: center; color: #333;">
                <h2>Welcome to PulseWrite!</h2>
                <p>Please use the following code to verify your email address:</p>
                <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; background-color: #f2f2f2; padding: 10px 20px; border-radius: 5px; display: inline-block;">
                    ${code}
                </p>
                <p>This code will expire in 1 hour.</p>
            </div>
        `,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    // Ethereal provides a URL to preview the sent email
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
    // Rethrow the error so the controller can handle it
    throw new Error("Email could not be sent.");
  }
};

module.exports = {
  sendVerificationEmail,
};
