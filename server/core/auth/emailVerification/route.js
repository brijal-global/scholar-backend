import { resendVerificationEmail, verifyEmail } from "./controller.js";

export default (router) => {
  router
    .route("/auth/resend-verification-email/:userType/:email")
    .get(resendVerificationEmail);

  router.route("/auth/verify-email/:token").get(verifyEmail);
};
