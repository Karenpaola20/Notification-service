export const handler = async (event) => {

  console.log("Event received:", JSON.stringify(event));

  for (const record of event.Records) {

    const message = JSON.parse(record.body);

    if (message.type === "WELCOME") {

      const { fullName, email } = message.data;

      console.log(`Sending welcome email to ${email}`);
      console.log(`Hello ${fullName}, welcome to Pig Bank`);
    }

  }

  return {
    statusCode: 200
  };
};