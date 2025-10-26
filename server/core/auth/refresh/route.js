import RefreshController from "./controller.js";

export default (router) => {
  /**
   * @swagger
   * /refresh:
   *   get:
   *     tags:
   *       - Authentication
   *     summary: Refresh access token
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *       401:
   *         description: Invalid refresh token
   */
  router.route("/auth/refresh").get(RefreshController.refreshUserToken);
};
