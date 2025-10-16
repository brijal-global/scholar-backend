import { HttpException, NotFoundException } from "../../exceptions/index.js";
import { models } from "../../../configs/server.config.js";
import successResponse from "../../utils/responses/successResponse.js";

export default (router) => {
  const allModels = Object.keys(models);
  const filteredModels = allModels.filter(
    (model) => model?.toLowerCase() !== "sequelize",
  );

  filteredModels.forEach((model) => {
    router.route(`/${model}`).post(async (req, res, next) => {
      try {
        const payload = req?.body || {};
        payload.createdBy = req?.user?.userId || null;
        payload.updatedBy = req?.user?.userId || null;

        if (!req?.ip)
          throw new HttpException(400, "User's IP not found!", model);

        payload.ip = req?.ip || null;

        const module = models?.[model];
        if (!module || !model || !payload) {
          throw new NotFoundException(`${model} not found!`, model);
        }
        const data = await module?.create(payload);
        if (!data) {
          throw new NotFoundException(`Not created!`, model);
        }
        successResponse(res, data, "create", model);
      } catch (err) {
        next(err);
      }
    });
  });
};
