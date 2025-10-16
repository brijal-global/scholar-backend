import BackupController from "./backup.controller.js";

export default (router) => {
  // reset superadmin
  router.route("/auth/reset-superadmin").get(BackupController.resetSuperAdmin);
};
