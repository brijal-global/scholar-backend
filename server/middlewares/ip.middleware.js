export const setIp = (req, res, next) => {
  try {
    const realIp =
      req.headers["cf-connecting-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.connection.remoteAddress;

    // Set the real IP address on a custom property
    req.clientIp = realIp;

    next();
  } catch (err) {
    next(err);
  }
};
