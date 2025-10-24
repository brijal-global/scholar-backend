import passport from "passport";

import { processAuth } from "../signin/signin.controller.js";

export default (router) => {
  router.route("/auth/linkedin/callback").get((req, res, next) => {
    passport.authenticate("linkedin", { session: true }, (err, user) => {
      if (err) {
        console.error("LinkedIn oauth error:", err);
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
            console.error("LinkedIn oauth login error: ", loginErr);
            return res.redirect("/failed");
          }

          processAuth(req, res, next, user, "redirect");
        });
      } catch (error) {
        console.error("Error in LinkedIn oauth callback:", error);
        return res.redirect("/failed");
      }
    })(req, res, next);
  });

  router.route("/auth/signin/linkedin/:userType").get((req, res, next) => {
    const { userType } = req.params;

    passport.authenticate("linkedin", {
      state: userType,
    })(req, res, next);
  });
};
