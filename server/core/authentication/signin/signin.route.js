import SigninController from "./signin.controller.js";
import RefreshController from "./refresh.controller.js";

export default (router) => {
  /**
   * @swagger
   * /signin/{userType}:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Sign in user
   *     parameters:
   *       - in: path
   *         name: userType
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   *       401:
   *         description: Invalid credentials
   *       404:
   *         description: User not found
   */
  router.route("/auth/signin/:userType").post(SigninController.signInUser);

  /**
   * @swagger
   * /refresh:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Refresh access token
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *       401:
   *         description: Invalid refresh token
   */
  router.route("/auth/refresh").post(RefreshController.refreshUserToken);
};
