import express from "express";
import hpp from "hpp";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import passport from "passport";
import session from "express-session";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import httpContext from "express-http-context";

import routes from "./core/index.js";
import db from "./lib/sequelize.js";
import upload from "./lib/multer.js";
import authMiddleware from "./middlewares/auth.middleware.js";
import passportJwtConfig from "./passport/jwt.passport.js";
import passportGoogleConfig from "./passport/google.passport.js";
import passportLinkedInConfig from "./passport/linkedin.passport.js";
import errorResponse from "./utils/responses/errorResponse.js";
import { setIp } from "./middlewares/ip.middleware.js";
import { setupSwagger } from "./lib/swagger.js";
import { frontend, database, server, github } from "../configs/env.config.js";
import { limiter, sessionConfig } from "../configs/server.config.js";

const app = express();
const router = express.Router();

app.set("trust proxy", server.noOfProxies); // Trusting the Proxy (Cloudflare or Load Balancer)
app.set("view engine", "ejs"); // EJS as templating engine for rendering views
app.use(hpp()); // Against HTTP parameter pollution
app.use(helmet()); // Add security-related HTTP headers
app.use(express.json({ limit: server.bodySizeLimit })); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true, limit: server.bodySizeLimit })); // Parse URL-encoded data
app.use(compression()); // Enable response compression for faster API responses
app.use(cookieParser()); // Parse cookies from HTTP requests
app.use(httpContext.middleware); // Attach request-scoped data (context)
app.use(setIp); // Set the IP address of the request origin in the request

// Configure express-session middleware
app.use(session(sessionConfig));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
passportJwtConfig(passport);
passportGoogleConfig(passport);
passportLinkedInConfig(passport);

if (server.env === "local" || server.env === "development") {
  app.use(
    cors({
      origin: [frontend.mainUrl, frontend.localUrl],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    }),
  );
  app.use(morgan("dev", {})); // Dev logging format
} else {
  app.use(
    cors({
      origin: [frontend.mainUrl, frontend.localUrl],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    }),
  );
  app.use(morgan("combined", {})); // More detailed logging for production
}

app.use(authMiddleware); // Global authentication middleware

app.use(upload);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, "../public"))); // Serve static frontend files

await db.sequelize
  .authenticate()
  .then(() => {
    let syncMode = database.syncMode;

    if (syncMode === "force" || syncMode === "alter" || syncMode === "sync") {
      db.sequelize.sync({ [syncMode]: true, logging: false });
    }

    console.info(`DB connected with sync mode: ${syncMode}`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// Home GET route
app.get("/health", (req, res, next) => {
  try {
    res.send({
      status: 200,
      message: `Hi, ${server.appName} is up and healthy!!!`,
      data: {
        ip: req.ip || "Not Found!",
        ips: req.ips || "Not Found!",
        clientIp: req.clientIp || "Not Found!",
        nodeEnv: server.env || "Not Found!",
        runNumber: github.runNumber || "Not Found!",
        commitMessage: github.commitMessage || "Not Found!",
      },
      source: "/health [GET]",
    });
  } catch (error) {
    next(error);
  }
});

//Initialize Application Routes
app.use("/api", limiter, await routes(router));

setupSwagger(app);

/**
 * 404 Error Handler
 * If no route matches, respond with a 404 error.
 */
app.use((req, res, next) => {
  const err = new Error();
  err.status = 404;
  err.message = "Route Not Found!";
  next(err);
});

/**
 * Global Error Handling Middleware
 * Handles all errors thrown in the app.
 */
app.use((err, req, res, next) => {
  try {
    let errorObj;

    const status = err?.status || 500;
    const path = req?.path || "-- Unknown Path --";
    const method = req?.method || "-- Unknown Method --";
    const message = err?.message || "Something went wrong!";
    const source = err?.source || `[${method}] ${path}`;
    const stack = err?.stack || "No stack trace available";

    console.error(
      `\n[${method}] ${path} >> StatusCode: ${status}, Message: ${message}`,
    );

    console.error(
      `${"-".repeat(100)} \nStack: ${stack} \n${"-".repeat(100)}\n`,
    );

    errorObj = errorResponse(status, message, source);

    return res.status(status).send(errorObj); // Send the error response as JSON
  } catch (error) {
    next(error); // In case of error in the error handler itself, call next middleware
  }
});

export default app;
