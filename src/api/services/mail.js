const nodemailer = require("nodemailer");

class Mail {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.googlemail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }
  sendMessage = async ({ email, title, message }) => {
    try {
      await this.transporter.sendMail({
        from: '"Buon Appointment" <buonappointment@gmail.com>', // sender address
        to: email, // list of receivers
        subject: title, // Subject line
        html: /*html*/ `
          <div>
            <h2>Ciao</h2>
            <p>${message}</p>
          </div>
        `,
      });
    } catch (err) {
      console.log(err);
    }
  };
}

const mail = new Mail();

module.exports = mail;
