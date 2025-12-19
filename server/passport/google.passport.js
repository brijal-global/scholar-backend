import GoogleStrategy from "passport-google-oauth20";
import { oauth } from "../../configs/env.config.js";
import { models } from "../../configs/server.config.js";

export default (passport) => {
  passport.serializeUser((user, done) => {
    done(null, {
      id: user.id,
    });
  });

  passport.deserializeUser(async (userObj, done) => {
    try {
      const { id } = userObj;
      let user = null;

      const userModel = models?.users;

      if (!userModel) return done(null, null);

      user = await userModel.findOne({ where: { id } });

      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: oauth.google.clientId,
        clientSecret: oauth.google.clientSecret,
        callbackURL: "/api/auth/google/callback",
        passReqToCallback: true,
        session: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const { id } = profile;
          let user = null;

          const userModel = models?.users;

          if (!userModel) return done(null, null);

          user = await userModel.findOne({
            where: { oAuthId: id },
            include: [
              {
                model: models.roles,
                as: "role",
                attributes: ["name"],
              },
            ],
          });

          if (!user) {
            user = await userModel.findOne({
              where: { email: profile.emails[0].value },
              include: [
                {
                  model: models.roles,
                  as: "role",
                  attributes: ["name"],
                },
              ],
            });
          }

          if (user?.id && !user.oAuthId) {
            await userModel.update(
              {
                oAuthId: id,
                oAuthProvider: "google",
                isEmailVerified: true,
              },
              { where: { id: user.id } },
            );
          }

          if (!user) {
            // create user if required or throw an error
          }

          return done(null, user?.dataValues || null);
        } catch (err) {
          console.error("Google OAuth Error: ", err);
          return done(err, null);
        }
      },
    ),
  );
};
