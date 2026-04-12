import { getJSONERD, getSequelizeERD } from "./controller.js";

export default (router) => {
  router.route("/erd").get(getSequelizeERD);

  router.route("/erd/json").get(getJSONERD);
};
