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

    router.route(`/${hyphenatedModel}/:id`).delete(async (req, res, next) => {
      try {
        const { id } = req?.params || {};
        const module = models?.[camelCaseModel];

        if (!module || !camelCaseModel || !id) {
          throw new NotFoundException(
            `${camelCaseModel} not found!`,
            camelCaseModel,
          );
        }

        const existingData = await module?.findByPk(id);
        if (!existingData) {
          throw new NotFoundException(
            `${camelCaseModel} not found!`,
            camelCaseModel,
          );
        }

        const data = await module?.destroy({ where: { id } });
        if (!data) {
          throw new NotFoundException(`Not deleted!`, camelCaseModel);
        }

        successResponse(
          res,
          `${camelCaseModel} deleted successfully!`,
          "Deleted successfully!",
          camelCaseModel,
        );
      } catch (err) {
        next(err);
      }
    });
  });
};
