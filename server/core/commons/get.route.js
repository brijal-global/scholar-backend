import { NotFoundException } from "../../exceptions/index.js";
import { models } from "../../../configs/server.config.js";
import successResponse from "../../utils/responses/successResponse.js";

export default (router) => {
  const allModels = Object.keys(models);
  const filteredModels = allModels.filter(
    (model) => model?.toLowerCase() !== "sequelize",
  );

  filteredModels.forEach((model) => {
    router.route(`/${model}`).get(async (req, res, next) => {
      try {
        const module = models?.[model];
        if (!module || !model) {
          throw new NotFoundException(`${model} not found!`, model);
        }
        const data = await module?.findAll({
          order: [
            ["createdAt", "DESC"],
            ["updatedAt", "DESC"],
            ["id", "ASC"],
          ],
        });
        if (!data) {
          throw new NotFoundException(`${model} not found!`, model);
        }
        successResponse(res, data, "fetch", model);
      } catch (err) {
        next(err);
      }
    });

    router.route(`/${model}/:id`).get(async (req, res, next) => {
      try {
        const { id } = req?.params || {};
        const module = models?.[model];
        if (!module || !model || !id) {
          throw new NotFoundException("Not found!", model);
        }
        const data = await module?.findByPk(id);
        if (!data) {
          throw new NotFoundException(`${model} not found!`, model);
        }
        successResponse(res, data, "fetch", model);
      } catch (err) {
        next(err);
      }
    });
  });
};
