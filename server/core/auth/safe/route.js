import SafeController from "./controller.js";

export default (router) => {
  // reset superadmin
  router.route("/auth/reset-superadmin").get(SafeController.resetSuperAdmin);
};
