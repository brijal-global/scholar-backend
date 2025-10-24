import { NotFoundException } from "../../../exceptions/index.js";
import { models } from "../../../../configs/server.config.js";
import successResponse from "../../../utils/responses/successResponse.js";
import { camelCaseToHyphen } from "../../../utils/helpers/stringFormatters.js";

export default (router) => {
  const allModels = Object.keys(models);
  const filteredModels = allModels.filter(
    (model) => model?.toLowerCase() !== "sequelize",
  );

  filteredModels.forEach((model) => {
    const camelCaseModel = model;
    const hyphenatedModel = camelCaseToHyphen(model);

    router.route(`/${hyphenatedModel}`).get(async (req, res, next) => {
      try {
        const module = models?.[camelCaseModel];
        if (!module || !camelCaseModel) {
          throw new NotFoundException(
            `${camelCaseModel} model not found!`,
            camelCaseModel,
          );
        }
        const data = await module?.findAll({
          order: [
            ["createdAt", "DESC"],
            ["updatedAt", "DESC"],
            ["id", "ASC"],
          ],
        });
        if (!data) {
          throw new NotFoundException(
            `${camelCaseModel} not found!`,
            camelCaseModel,
          );
        }
        successResponse(res, data, "fetch", camelCaseModel);
      } catch (err) {
        next(err);
      }
    });

    router.route(`/${hyphenatedModel}/:id`).get(async (req, res, next) => {
      try {
        const { id } = req?.params || {};
        const module = models?.[camelCaseModel];
        if (!module || !camelCaseModel || !id) {
          throw new NotFoundException("Not found!", camelCaseModel);
        }
        const data = await module?.findByPk(id);
        if (!data) {
          throw new NotFoundException(
            `${camelCaseModel} not found!`,
            camelCaseModel,
          );
        }
        successResponse(res, data, "fetch", camelCaseModel);
      } catch (err) {
        next(err);
      }
    });
  });
};
