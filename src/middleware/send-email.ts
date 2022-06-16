import sgMail from "@sendgrid/mail";
import { SendgridMessageBody } from "../shared/models/sendgrid-message-body";

export const sendMessage = (message: SendgridMessageBody) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
  sgMail.send(message).then(() => {}, error => {
    console.log(error.response.body)
  });
};
