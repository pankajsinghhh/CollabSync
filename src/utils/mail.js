import Mailgen from "mailgen";
import nodemailer from "nodemailer"

const sendemail = async (options) => {
  const mailgenerator = new Mailgen({
    theme: "default",
    product: {
      name: "TaskManager",
      link: "https://taskmanagelink.com"
    }
  })
  const emailtextual = mailgenerator.generatePlaintext(options.mailgenContent);
  const emailhtml = mailgenerator.generate(options.mailgenContent)
  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS
    }
  })
  const mail = {
    from: "mail.taskmanager@example.com",
    to: options.email,
    subject: options.subject,
    text: emailtextual,
    html: emailhtml
  }
  try {
    await transporter.sendMail(mail)
  } catch (error) {
    console.error("email service failed silently, this might have happened because of the credentials, make sure that you have provided mailtrap credientials in .env file")
    console.error(error);
  }
}
const emailverificationmailgencontent = (username, verificationurl) => {
  return {
    body: {
      name: username,
      intro: "welcome to out app",
      action: {
        instructions: "To verify email click on following button",
        button: {
          color: "#1aae5aff",
          text: "verify your email",
          link: verificationurl,
        },
      },
      outro: "need help of have questions?, we would help",
    },
  };
};
const fogotpassowordmailgencontent = (username, passwordreseturl) => {
  return {
    body: {
      name: username,
      intro: "we got a request to reset the password of your account",
      action: {
        instructions: "To reset your password, click on the following button",
        button: {
          color: "rgb(64, 25, 202)",
          text: "Reset password",
          link: passwordreseturlurl,
        },
      },
      outro: "need help of have questions?, we would help",
    },
  };
};
export {
    emailverificationmailgencontent,
  fogotpassowordmailgencontent,
    sendemail
};