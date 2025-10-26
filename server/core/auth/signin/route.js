import SigninController from "./controller.js";

export default (router) => {
  /**
   * @swagger
   * /signin:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Sign in user
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
  router.route("/auth/signin").post(SigninController.signInUser);
};
