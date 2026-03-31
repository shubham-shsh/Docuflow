import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `DocuFlow 👨‍💻 <${process.env.EMAIL_FROM || "noreply@docuflow.co.in"}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend Error:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    console.error("Failed to send email:", err);
    throw err;
  }
};

export { sendEmail };