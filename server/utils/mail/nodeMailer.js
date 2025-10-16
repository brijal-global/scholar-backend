import ejs from "ejs";
import path from "path";
import nodemailer from "nodemailer";
import { frontend, mailerConfig, server } from "../../../configs/env.config.js";

const sendEmail = (data) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport(mailerConfig);

    try {
      if (!data?.reciever) {
        return reject(new Error("Reciever is required!"));
      } else if (!data?.subject) {
        return reject(new Error("Subject is required!"));
      } else if (!data?.templateFile) {
        return reject(new Error("Template file is required!"));
      } else if (!server?.appName) {
        return reject(new Error("Set the app name in the env file!"));
      } else if (!frontend?.url) {
        return reject(new Error("Set the frontend URL in the env file!"));
      }

      data.subject = `${data.subject} | ${server.appName}`;
      data.priority = data?.priority || "normal";
      data.variables = data?.variables || {};

      // Remove the .ejs extension if it exists
      if (data.templateFile.includes(".ejs")) {
        data.templateFile = data.templateFile.replace(".ejs", "");
      }

      const context = {
        ...data.variables,
        appName: server.appName,
        appUrl: frontend.mainUrl.replace("http://", "").replace("https://", ""),
        appLogo: `${frontend.mainUrl}/favicon.ico`,
      };

      // EJS template setup
      transporter.use("compile", (mail, callback) => {
        ejs.renderFile(
          path.join(
            path.resolve("public/views/emailTemplates"),
            `${data.templateFile}.ejs`,
          ),
          context,
          (err, renderedHtml) => {
            if (err) {
              console.error(`Error rendering EJS template: ${err.message}`);
              return callback(err);
            }
            mail.data.html = renderedHtml;
            callback();
          },
        );
      });

      const mailOptions = {
        from: `${server.appName} <${mailerConfig.auth.user}>`, // sender address
        to: [data.reciever], // list of receivers
        subject: data.subject,
        template: data.templateFile,
        context,
      };

      // Send the email
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`Failed to send email: ${error.message}`);
          return reject(error);
        }
        console.info(`Mail sent: ${info.response}`);
        resolve(`Mail sent to ${data.reciever} successfully`);
      });
    } catch (err) {
      console.error(`Mailer setup failed: ${err.message}`);
      reject(err);
    }
  });
};

export default sendEmail;
