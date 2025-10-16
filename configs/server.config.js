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
