export default {
    BASE_URL: process.env.BASE_URL,
    PORT: process.env.PORT || "3000",
    SLACK: {
      CLIENT_ID: process.env.SLACK_CLIENT_ID,
      CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET
    }
  };