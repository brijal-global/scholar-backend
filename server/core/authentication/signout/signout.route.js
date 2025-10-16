import SignoutController from "./signout.controller.js";

export default (router) => {
  /**
   * @swagger
   * /signup/{userType}:
   *   post:
   *     tags:
   *       - Authentication
   *     summary: Register new user
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
   *               - firstName
   *               - lastName
   *               - email
   *               - password
   *             properties:
   *               firstName:
   *                 type: string
   *               lastName:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *               phone:
   *                 type: string
   *               address:
   *                 type: string
   *               profileImage:
   *                 type: string
   *               profession:
   *                 type: string
   *               companyName:
   *                 type: string
   *               gender:
   *                 type: string
   *               isTermsAndConditionsAccepted:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: User created successfully
   *       400:
   *         description: Validation error
   *       409:
   *         description: User already exists
   */
  router.route("/auth/signout").get(SignoutController.signOutUser);
};
