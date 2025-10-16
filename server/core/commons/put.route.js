import { HttpException, NotFoundException } from "../../exceptions/index.js";
import { models } from "../../../configs/server.config.js";
import successResponse from "../../utils/responses/successResponse.js";

export default (router) => {
  const allModels = Object.keys(models);
  const filteredModels = allModels.filter(
    (model) => model?.toLowerCase() !== "sequelize",
  );

  filteredModels.forEach((model) => {
    router.route(`/${model}/:id`).put(async (req, res, next) => {
      try {
        const { id } = req?.params || {};
        const module = models?.[model];

        if (!module || !model || !id) {
          throw new NotFoundException(`${model} not found!`, model);
        }

        const existingData = await module?.findByPk(id);
        if (!existingData) {
          throw new NotFoundException(`${model} not found!`, model);
        }

        const payload = req.body;
        payload.updatedBy = req?.user?.id || null;

        if (!req?.ip)
          throw new HttpException(400, "User's IP not found!", model);
        payload.ip = req?.ip;

        if (req?.user?.userId) payload.updatedBy = req?.user?.userId;

        const data = await module?.update(payload, {
          where: { id },
          returning: true,
        });

        if (!data?.[1]?.[0]) {
          throw new HttpException(400, `Not updated!`, model);
        }

        successResponse(res, data?.[1]?.[0], "update", model);
      } catch (err) {
        next(err);
      }
    });
  });
};
