const path = require("path");
const logger = require("pino")();
const envPath = path.join(__dirname, "../", ".env");
require("dotenv").config({
  path: envPath
});

const { env } = process;

let config = {
  port: env.PORT || 80,
  mongoDBUrl: env.MONGO_URL,
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT
  }
};

if (env.CORS_ORIGIN) {
  try {
    config.corsorigin = JSON.parse(env.CORS_ORIGIN);
  } catch (err) {
    logger.error(err);
  }
}

module.exports = config;
