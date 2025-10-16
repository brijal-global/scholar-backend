import passport from "passport";

import { processAuth } from "../signin/signin.controller.js";

export default (router) => {
  router.route("/auth/google/callback").get((req, res, next) => {
    passport.authenticate("google", { session: true }, (err, user) => {
      if (err) {
        console.error("Google oauth error:", err);
        return res.redirect("/failed");
      }

      if (!user) {
        console.error("No user found!");
        return res.redirect("/failed");
      }

      try {
        // Login the user
        req.login(user, async (loginErr) => {
          if (loginErr) {
            console.error("Google oauth login error: ", loginErr);
            return res.redirect("/failed");
          }

          processAuth(req, res, next, user, "redirect");
        });
      } catch (error) {
        console.error("Error in Google oauth callback:", error);
        return res.redirect("/failed");
      }
    })(req, res, next);
  });

  router.route("/auth/signin/google/:userType").get((req, res, next) => {
    const { userType } = req.params;

    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: userType,
    })(req, res, next);
  });
};
