import LinkedInStrategy from "passport-linkedin-oauth2";
import { oauth } from "../../configs/env.config.js";
import { models } from "../../configs/server.config.js";

export default (passport) => {
  passport.use(
    new LinkedInStrategy.Strategy(
      {
        clientID: oauth.linkedin.clientId,
        clientSecret: oauth.linkedin.clientSecret,
        callbackURL: "/api/auth/linkedin/callback",
        scope: ["r_emailaddress", "r_liteprofile"],
        passReqToCallback: true,
        session: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const userType = req.query.state;
          const { id } = profile;
          let user = null;

          const userModel = models?.[userType];

          if (!userModel) return done(null, null);

          user = await userModel.findOne({ where: { oAuthId: id } });

          if (!user) {
            user = await userModel.findOne({
              where: { email: profile.emails[0].value },
            });
          }

          if (user?.id && !user.oAuthId) {
            await userModel.update(
              {
                oAuthId: id,
                oAuthProvider: "linkedin",
                isEmailVerified: true,
              },
              { where: { id: user.id } },
            );
          }

          if (!user) {
            const newUser = await models.user.create({ userType });
            user = await userModel.create({
              oAuthId: id,
              oAuthProvider: "linkedin",
              userId: newUser.userId,
              isEmailVerified: true,
              email: profile.emails[0].value,
              name: profile.displayName || "User",
              firstName:
                profile.name.givenName ||
                profile.displayName.split(" ")[0] ||
                "User",
              lastName:
                profile.name.familyName ||
                profile.displayName.split(" ").slice(1).join(" ") ||
                "User",
              ip: req.ip,
              profileImage: profile.photos?.[0]?.value || null,
              isTermsAndConditionsAccepted: true,
            });
          }

          return done(null, {
            ...user?.dataValues,
            user: { userType },
          });
        } catch (err) {
          console.error("LinkedIn OAuth Error:", err);
          return done(err, null);
        }
      },
    ),
  );
};
