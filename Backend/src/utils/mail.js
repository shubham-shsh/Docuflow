import nodemailer from "nodemailer";

const send = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"DocuFlow 👨‍💻" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await send.sendMail(mailOptions);
};

export  {sendEmail};
