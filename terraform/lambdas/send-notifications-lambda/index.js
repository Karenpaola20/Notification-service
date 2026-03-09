import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import crypto from "crypto";

const ses = new SESClient({ region: "us-east-1" });
const s3 = new S3Client({ region: "us-east-1" });
const dynamo = new DynamoDBClient({ region: "us-east-1" });

const TEMPLATE_BUCKET = process.env.TEMPLATE_BUCKET;
const NOTIFICATION_TABLE = process.env.NOTIFICATION_TABLE;

export const handler = async (event) => {

  for (const record of event.Records) {

    const message = JSON.parse(record.body);

    switch (message.type) {

      case "WELCOME": {

        const { fullName, email } = message.data;

        let template = await getTemplate("welcome.html");

        template = template.replace("{{fullName}}", fullName);

        await sendEmail(email, "Welcome to Pig Bank 🐷", template);

        await saveNotification("WELCOME", email);

        console.log("Welcome email sent to:", email);

        break;
      }

      case "USER.LOGIN": {

        const { date, email } = message.data;

        let template = await getTemplate("login.html");

        template = template.replace("{{date}}", date);

        await sendEmail(email, "Login detected - Pig Bank", template);

        await saveNotification("USER.LOGIN", email);

        console.log("Login email sent to:", email);

        break;
      }

      case "USER.UPDATE": {

        const { fullName, email, date } = message.data;

        let template = await getTemplate("update.html");

        template = template
          .replace("{{fullName}}", fullName)
          .replace("{{date}}", date);

        await sendEmail(email, "Your profile was updated", template);

        await saveNotification("USER.UPDATE", email);

        console.log("Update email sent to: ", email);

        break;
      }

      case "CARD.ACTIVATE": {

        const { date, type, amount, email } = message.data;

        let template = await getTemplate("card-activate.html");

        template = template
          .replace("{{date}}", date)
          .replace("{{type}}", type)
          .replace("{{amount}}", amount);

        await sendEmail(email, "Your credit card has been activated 🎉", template);

        await saveNotification("CARD.ACTIVATE", email);

        break;
      }

      case "TRANSACTION.PURCHASE": {

        const { date, merchant, amount, email } = message.data;

        let template = await getTemplate("transaction-purchase.html");

        template = template
          .replace("{{date}}", date)
          .replace("{{merchant}}", merchant)
          .replace("{{amount}}", amount);

        await sendEmail(email, "Purchase detected 💳", template);

        await saveNotification("TRANSACTION.PURCHASE", email);

        console.log("Purchase email sent to:", email);

        break;
      }

      default:
        console.log("Unknown notification type:", message.type);
    }
  }
};

async function sendEmail(email, subject, body) {

  const params = {
    Source: "kbuelvas899@gmail.com",
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: { Data: subject },
      Body: {
        Html: { Data: body }
      }
    }
  };

  await ses.send(new SendEmailCommand(params));
}

async function getTemplate(templateName) {

  const command = new GetObjectCommand({
    Bucket: TEMPLATE_BUCKET,
    Key: templateName
  });

  const response = await s3.send(command);

  return await response.Body.transformToString();
}

async function saveNotification(type, email) {

  const params = {
    TableName: NOTIFICATION_TABLE,
    Item: {
      id: { S: crypto.randomUUID() },
      type: { S: type },
      email: { S: email },
      status: { S: "SENT" },
      createdAt: { S: new Date().toISOString() }
    }
  };

  await dynamo.send(new PutItemCommand(params));
}