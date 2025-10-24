import PasswordController from "./password.controller.js";

export default (router) => {
  router
    .route("/auth/change-my-password")
    .put(PasswordController.changeMyPassword);
};
