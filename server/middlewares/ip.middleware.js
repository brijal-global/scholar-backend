import httpContext from "express-http-context";

export const setIp = (req, res, next) => {
  try {
    const clientIp =
      req.headers["cf-connecting-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.connection.remoteAddress;

    // Set the IP address on a custom property
    httpContext.set("defaultIp", req?.ip);
    httpContext.set("ip", clientIp);

    next();
  } catch (err) {
    next(err);
  }
};
