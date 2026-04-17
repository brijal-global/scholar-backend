import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { jwtConfig } from "../../configs/env.config.js";
import { isUserAllowed } from "../../configs/permission.js";
import { models, tokenConfigs } from "../../configs/server.config.js";
import { getCustomUserForMeRoute } from "../../src/modules/users/repository.js";

const { users, accessTokens, roles } = models;

let extractedAccessToken = null;

export const extractAccessToken = (req) => {
  const extractedAccessToken = req?.cookies?.accessToken || null;
  return extractedAccessToken;
};

export const extractRefreshToken = (req) => {
  const extractedRefreshToken = req?.cookies?.refreshToken || null;
  return extractedRefreshToken;
};

const opts = {
  jwtFromRequest: ExtractJwt.fromExtractors([extractAccessToken]),
  secretOrKey: jwtConfig.accessTokenSecret,
  algorithms: ["HS256"],
  passReqToCallback: true,
};

const jwtPassportConfig = (passport) => {
  passport.use(
    new JwtStrategy(opts, async (req, jwt_payload, done) => {
      try {
        const { sub, roleId } = jwt_payload;

        extractedAccessToken = extractAccessToken(req);
        if (!extractedAccessToken) return done(null, false);

        if (tokenConfigs?.verifyAccessTokenFromDB) {
          const accessTokenFromDB = await accessTokens.findOne({
            where: {
              accessToken: extractedAccessToken,
              isActive: true,
            },
            raw: true,
          });
          if (!accessTokenFromDB) return done(null, false);
        }

        let user = null;

        user = await getCustomUserForMeRoute(sub, roleId);

        if (!user) {
          user = await users.findOne({
            where: { id: sub },
            include: [
              {
                model: roles,
                as: "role",
                attributes: ["id", "name", "slug"],
                required: true,
              },
            ],
          });
        }

        if (!user) return done(null, false);

        const route = req.originalUrl;
        const method = req.method;

        const isAllowed = await isUserAllowed(route, method, user.roleId);

        if (!isAllowed) return done(null, false);

        delete user?.password;

        return done(null, user || null);
      } catch (err) {
        console.error("Error in jwt.passport.js: ", err);
        return done(err, false);
      }
    }),
  );
};

export default jwtPassportConfig;
