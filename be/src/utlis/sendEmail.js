import nodemailer from "nodemailer";

const sendEmail = async (recipients, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "scoutsmanilacouncil@gmail.com",
        pass: "fwgx lgqm mbsy ytxl",
      },
    });

    const mailOptions = {
      from: "scoutsmanilacouncil@gmail.com", // * Sender address
      to: recipients.join(","), // * Receiver address
      subject, // * Subject line
      text, // * Plain text body
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export { sendEmail };
