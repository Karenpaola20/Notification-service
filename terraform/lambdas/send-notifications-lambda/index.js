import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({ region: "us-east-1" });

export const handler = async (event) => {

  for (const record of event.Records) {

    const message = JSON.parse(record.body);

    switch (message.type) {

      case "WELCOME": {

        const { fullName, email } = message.data;

        const params = {
          Source: "kbuelvas899@gmail.com",
          Destination: {
            ToAddresses: [email],
          },
          Message: {
            Subject: {
              Data: "Welcome to Pig Bank 🐷"
            },
            Body: {
              Text: {
                Data: `Hello ${fullName}, welcome to Pig Bank!`
              }
            }
          }
        };

        await ses.send(new SendEmailCommand(params));

        console.log("Welcome email sent to:", email);

        break;
      }

      case "USER.LOGIN": {

        const { date, email } = message.data;

        const params = {
          Source: "kbuelvas899@gmail.com",
          Destination: {
            ToAddresses: [email],
          },
          Message: {
            Subject: {
              Data: "Login detected - Pig Bank"
            },
            Body: {
              Text: {
                Data: `A login to your account was detected on ${date}`
              }
            }
          }
        };

        await ses.send(new SendEmailCommand(params));

        console.log("Login email sent to:", email);

        break;
      }

      default:
        console.log("Unknown notification type:", message.type);
    }
  }
};