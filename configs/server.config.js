import rateLimit from "express-rate-limit";
import db from "../server/lib/sequelize.js";
import { server, session, backend, frontend } from "./env.config.js";
import sendEmail from "../server/utils/mail/nodeMailer.js";

export const models = db;

export { sendEmail };

// Rate limiting
export const limiter = rateLimit({
  windowMs: server.rateLimit.windowMs * 60 * 1000,
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
    maxAge: 24 * 60 * 60 * 1000,
  },
};

export const cookieConfig = {
  secure: true,
  httpOnly: true,
  path: "/",
  ...(server.env === "production" ? { sameSite: `none` } : { sameSite: `none` }),
  ...(server.env === "production" && { domain: `.${server.mainDomain}` }),
};

export const oAuthConfigs = {
  google: {
    available: true,
    url: `${backend.mainUrl}/api/auth/signin/google`,
    callbackURL: `${backend.mainUrl}/api/auth/google/callback`,
  },
  linkedin: {
    available: false,
    url: `${backend.mainUrl}/api/auth/signin/linkedin`,
    callbackURL: `${backend.mainUrl}/api/auth/linkedin/callback`,
  },
};

export const ids = {
  superAdminRoleId: "eff3af9d-5fbe-48be-bbf4-aac2eedf5967",
  organizationEmployeeRoleId: "eff3af9d-5fbe-48be-bbf4-aac2eedf5968",
  studentRoleId: "eff3af9d-5fbe-48be-bbf4-aac2eedf5969",
};

export const tokenConfigs = {
  verifyAccessTokenFromRedis: false,
  verifyAccessTokenFromDB: true,
  verifyRefreshTokenFromRedis: false,
  verifyRefreshTokenFromDB: true,
};
