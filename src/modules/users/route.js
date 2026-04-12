import { registerCollegeOwner } from "./controller.js";

export default (router) => {
  router.route("/auth/signup/college-owner").post(registerCollegeOwner);
};
