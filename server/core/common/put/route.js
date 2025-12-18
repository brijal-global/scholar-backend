import { HttpException, NotFoundException } from "../../../exceptions/index.js";
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

    router.route(`/${hyphenatedModel}/:id`).put(async (req, res, next) => {
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

        const payload = req.body;
        payload.updatedBy = req?.user?.id || null;

        if (!req?.ip)
          throw new HttpException(400, "User's IP not found!", camelCaseModel);
        payload.ip = req?.ip;

        if (req?.user?.id) payload.updatedBy = req?.user?.id;

        const data = await module?.update(payload, {
          where: { id },
          returning: true,
        });

        if (!data?.[1]) {
          throw new HttpException(400, `Not updated!`, camelCaseModel);
        }

        successResponse(
          res,
          data?.[1]?.[0],
          "Updated successfully!",
          camelCaseModel,
        );
      } catch (err) {
        next(err);
      }
    });
  });
};
