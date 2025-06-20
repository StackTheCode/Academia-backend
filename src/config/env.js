require('dotenv').config(); // This loads .env from the root by default

module.exports = {
  PORT: process.env.PORT,
  ME_PORT: process.env.ME_PORT,
  MONGO_PORT: process.env.MONGO_PORT,
  NODE_ENV: process.env.NODE_ENV,
  MONGO_USER: process.env.MONGO_USER,
  MONGO_PASSWORD: process.env.MONGO_PASSWORD,
  ME_USER: process.env.ME_USER,
  ME_PASSWORD: process.env.ME_PASSWORD,
  MONGO_DB: process.env.MONGO_DB,
  MONGO_URI: process.env.MONGO_URI,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  FRONTEND_URI: process.env.FRONTEND_URI,
  BUCKET_NAME: process.env.BUCKET_NAME,
  BUCKET_REGION: process.env.BUCKET_REGION,
  ACCESS_KEY: process.env.ACCESS_KEY,
  SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
};
