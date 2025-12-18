import dotenv from "dotenv";

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});

export const github = {
  runNumber: process.env.GITHUB_RUN_NUMBER,
  commitMessage: process.env.GITHUB_COMMIT_MESSAGE,
};

// Server Configuration
export const server = {
  appName: process.env.APP_NAME,
  env: process.env.NODE_ENV,
  port: process.env.APP_PORT,
  maxMemory: process.env.MAX_MEMORY,
  minMemory: process.env.MIN_MEMORY,
  noOfProxies: process.env.NUMBER_OF_PROXIES,
  bodySizeLimit: process.env.REQUEST_BODY_SIZE_LIMIT,
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_TIME_WINDOW_IN_MINUTE,
    max: process.env.RATE_LIMIT_MAX_AMOUNT,
  },
  mainDomain: process.env.MAIN_DOMAIN,
};

// Frontend
export const frontend = {
  mainUrl: process.env.FRONTEND_MAIN_URL,
  localUrl: process.env.FRONTEND_LOCAL_URL,
};

// Backend
export const backend = {
  mainUrl: process.env.BACKEND_MAIN_URL,
};

// session
export const session = {
  secret: process.env.SESSION_SECRET,
};

// JWT Token Configuration
export const jwtConfig = {
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  generalTokenSecret: process.env.GENERAL_TOKEN_SECRET,
  generalTokenExpiresIn: process.env.GENERAL_TOKEN_EXPIRES_IN,
};

//  Mailer Configuration
export const mailerConfig = {
  service: process.env.MAIL_SERVICE,
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
};

// Email addresses for recieving emails
export const emails = {
  noReply: process.env.NO_REPLY_EMAIL,
  help: process.env.HELP_EMAIL,
  support: process.env.SUPPORT_EMAIL,
  marketing: process.env.MARKETING_EMAIL,
  info: process.env.INFO_EMAIL,
  sales: process.env.SALES_EMAIL,
  career: process.env.CAREER_EMAIL,
  other: process.env.OTHER_EMAIL,
};

// Super Admin Configuration
export const superAdmin = {
  firstName: process.env.SUPER_ADMIN_NAME?.split(" ")?.[0] || "Super",
  lastName: process.env.SUPER_ADMIN_NAME?.split(" ")?.[1] || "Admin",
  email: process.env.SUPER_ADMIN_EMAIL,
  phone: process.env.SUPER_ADMIN_PHONE,
  password: process.env.SUPER_ADMIN_PASSWORD,
};

// Zoom Configuration
export const zoom = {
  accountId: process.env.ZOOM_ACCOUNT_ID,
  clientId: process.env.ZOOM_CLIENT_ID,
  clientSecret: process.env.ZOOM_CLIENT_SECRET,
};

// whatsapp
export const whatsapp = {
  apiUrl: process.env.WHATSAPP_API_URL,
  apiKey: process.env.WHATSAPP_API_KEY,
};

// OAuth Configuration
export const oauth = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  },
};

// File Upload Configuration
export const fileStorage = {
  target: process.env.FILE_STORAGE_TARGET,
};

// Cloudinary Configuration
export const cloudinary = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

// Database dialect
export const database = {
  dialect: process.env.DATABASE_DIALECT,
  syncMode: process.env.DATABASE_SYNC_MODE,
};

// Redis Configuration
export const redis = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  user: process.env.REDIS_USER,
  password: process.env.REDIS_PASSWORD,
  database: process.env.REDIS_DATABASE,
  ssl: process.env.REDIS_SSL,
};

// PostgreSQL Configuration
export const postgres = {
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  ssl: process.env.POSTGRES_SSL,
  ca: process.env.POSTGRES_CA,
};
