require("dotenv-flow").config();

module.exports = {
  alpaca: {
    clientId: process.env.ALPACA_CLIENT_ID,
    clientSecret: process.env.ALPACA_CLIENT_SECRET,
    liveApiKey: process.env.ALPACA_LIVE_API_KEY,
    liveApiKeySecret: process.env.ALPACA_LIVE_API_SECRET_KEY,
    paperApiKey: process.env.ALPACA_PAPER_API_KEY,
    paperApiKeySecret: process.env.ALPACA_PAPER_API_SECRET_KEY
  },
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
  },
  polygon: {
    apiKey: process.env.POLYGON_API_KEY
  }
};
