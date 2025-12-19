import successResponse from "../../../utils/responses/successResponse.js";
import { oAuthConfigs } from "../../../../configs/server.config.js";

export default (router) => {
  router.route("/auth/oauth/configs").get((req, res, next) => {
    try {
      successResponse(
        res,
        oAuthConfigs,
        "OAuth configs fetched successfully!!!!!!!!!!!",
        "auth.oauth",
      );
    } catch (error) {
      next(error);
    }
  });
};
