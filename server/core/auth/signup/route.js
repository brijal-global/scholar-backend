import SignupController from "./controller.js";

export default (router) => {
  router.route("/auth/signup/:roleName").post(SignupController.signupUser);
};
