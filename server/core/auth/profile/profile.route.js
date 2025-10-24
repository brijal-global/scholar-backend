import ProfileController from "./profile.controller.js";

export default (router) => {
  /**
   * @swagger
   * /me:
   *   get:
   *     tags:
   *       - Authentication
   *     summary: Get current user
   *     responses:
   *       200:
   *         description: Current user information
   *       401:
   *         description: Unauthorized
   */
  router.route("/auth/me").get(ProfileController.currentUser);

  router
    .route("/auth/update-my-profile")
    .put(ProfileController.updateMyProfile);
};
