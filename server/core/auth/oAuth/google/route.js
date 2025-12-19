import passport from "passport";

import { processAuth } from "../../signin/controller.js";
import { frontend } from "../../../../../configs/env.config.js";

export default (router) => {
  router.route("/auth/google/callback").get((req, res, next) => {
    passport.authenticate("google", { session: true }, (err, user) => {
      const failedUrl = `${frontend.mainUrl}/oauth/failed`;

      if (err) {
        console.error("Google oauth error: ", err?.message || err);
        return res.redirect(failedUrl);
      }

      if (!user) {
        return res.redirect(`${failedUrl}?error=no_user_found`);
      }

      try {
        // Login the user
        req.login(user, async (loginErr) => {
          if (loginErr) {
            console.error("Google oauth login error: ", loginErr);
            return res.redirect(failedUrl);
          }

          processAuth(req, res, next, user, "redirect");
        });
      } catch (error) {
        console.error("Error in Google oauth callback:", error);
        return res.redirect(failedUrl);
      }
    })(req, res, next);
  });

  router.route("/auth/google").get((req, res, next) => {
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })(req, res, next);
  });
};
