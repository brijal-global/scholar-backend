import rateLimit from "express-rate-limit";
import db from "../server/lib/sequelize.js";
import { server, session } from "./env.config.js";
import sendEmail from "../server/utils/mail/nodeMailer.js";

export const models = db;

export { sendEmail };

// Rate limiting
export const limiter = rateLimit({
  windowMs: server.rateLimit.windowMs * 60 * 1000, // converting minutes to milliseconds
  max: server.rateLimit.max,
  message: {
    status: 429,
    message: "Too many requests from this IP, Please try again later!",
  },
});

// session
export const sessionConfig = {
  secret: session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
};

export const cookieConfig = {
  secure: true,
  httpOnly: true,
  path: "/",
  ...(server.env === "production" ? { sameSite: `lax` } : { sameSite: `none` }), // samesite lax only in production
  ...(server.env === "production" && { domain: `.${server.mainDomain}` }), // domain only in production
};

export const oAuthConfigs = {
  google: {
    available: true,
    url: "/api/auth/signin/google",
    callbackURL: "/api/auth/google/callback",
  },
  linkedin: {
    available: false,
    url: "/api/auth/signin/linkedin",
    callbackURL: "/api/auth/linkedin/callback",
  },
};

export const superAdminRoleId = "eff3af9d-5fbe-48be-bbf4-aac2eedf5967";
