import Mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {

    const Mailgenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link: "https://taskmanagerlink.com"
        }
    });

    const emailText = Mailgenerator.generatePlaintext(options.MailgenContent);

    const emailHTML = Mailgenerator.generate(options.MailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_SMTP_HOST,
        port: process.env.MAIL_SMTP_PORT,
        auth: {
            user: process.env.MAIL_SMTP_USER,
            pass: process.env.MAIL_SMTP_PASS
        }
    });

    const mail = {
        from: "mail.taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHTML
    };

    try {

        await transporter.sendMail(mail);

    } 
    catch(error) {

        console.error(
            "EMAIL SERVICE FAILED PLEASE CHECK MAIL CREDENTIALS"
        );

        console.error(error);
    }
};

const emailVerificationMailgenContent = (username, verificationURL) => {

    return {
        body: {
            name: username,
            intro: "Welcome to our App. We are excited to have you with us",

            action: {
                instructions:
                    "To verify your email please click the button below",

                button: {
                    color: "#22BC66",
                    text: "Verify your email",
                    link: verificationURL
                }
            },

            outro:
                "Need help? Reply to this email and we’ll help you."
        }
    };
};

const forgotPasswordMailgenContent = (username, verificationURL) => {

    return {
        body: {
            name: username,

            intro:
                "We received a request to reset your password",

            action: {
                instructions:
                    "Click the button below to reset your password",

                button: {
                    color: "#ba3477",
                    text: "Reset Password",
                    link: verificationURL
                }
            },

            outro:
                "Need help? Reply to this email and we’ll help you."
        }
    };
};

export {
    sendEmail,
    emailVerificationMailgenContent,
    forgotPasswordMailgenContent
};