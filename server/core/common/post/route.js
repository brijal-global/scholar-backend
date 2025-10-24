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

    router.route(`/${hyphenatedModel}`).post(async (req, res, next) => {
      try {
        const payload = req?.body || {};
        payload.createdBy = req?.user?.userId || null;
        payload.updatedBy = req?.user?.userId || null;

        if (!req?.ip)
          throw new HttpException(400, "User's IP not found!", camelCaseModel);

        payload.ip = req?.ip || null;

        const module = models?.[camelCaseModel];
        if (!module || !camelCaseModel || !payload) {
          throw new NotFoundException(
            `${camelCaseModel} not found!`,
            camelCaseModel,
          );
        }
        const data = await module?.create(payload);
        if (!data) {
          throw new NotFoundException(`Not created!`, camelCaseModel);
        }
        successResponse(res, data, "create", camelCaseModel);
      } catch (err) {
        next(err);
      }
    });
  });
};
