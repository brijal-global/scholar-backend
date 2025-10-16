import passport from "passport";
import { match } from "node-match-path";
import publicPermission from "../../src/modules/user/public/public.permissions.js";
import { AuthException } from "../exceptions/index.js";

const authMiddleware = (req, res, next) => {
  try {
    const isPublicRoute = publicPermission.some((item) => {
      const { matches } = match(item.route, req.path);
      const isMethodMatch = item.methods.includes(req.method);
      return matches && isMethodMatch;
    });

    if (isPublicRoute) {
      next();
    } else {
      passport.authenticate("jwt", { session: false }, (err, user, info) => {
        try {
          if (!user || err) {
            console.error(
              "\nJWT Auth failed:",
              info?.message || "Unknown reason\n",
              err,
            );

            throw new AuthException("unauthorized", "auth");
          } else {
            req.user = user;
            next();
          }
        } catch (error) {
          next(error);
        }
      })(req, res, next);
    }
  } catch (err) {
    next(err);
  }
};

export default authMiddleware;
