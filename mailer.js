require("dotenv").config();
const nodemailer = require("nodemailer");
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: String(process.env.EMAIL),
    pass: String(process.env.APP_PASS),
  },
});

module.exports = (emails, slotDetails) => {
  return new Promise((resolve, reject) => {
    let mailOptions = {
      from: "Vaccine Hunt " + process.env.EMAIL,
      bcc: emails,
      subject: "Hurry Up!🏃‍♂️ Vaccination slots available!",
      text: slotDetails,
    };

    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error while sending Email: ", error);
        return reject(error);
      }
      resolve(info);
    });
  });
};
