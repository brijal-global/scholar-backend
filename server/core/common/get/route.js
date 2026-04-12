import { NotFoundException } from "../../../exceptions/index.js";
import { models } from "../../../../configs/server.config.js";
import successResponse from "../../../utils/responses/successResponse.js";
import { camelCaseToHyphen } from "../../../utils/helpers/stringFormatters.js";
import {
  buildPaginatedListQuery,
  formatPaginatedResponse,
} from "./listQuery.js";

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

        const { populate = [] } = req?.query || {};

        const { where, offset, limit, order, page, queryEcho } =
          buildPaginatedListQuery(req.query);

        const queryOptions = {
          where,
          offset,
          limit,
          order,
          include: populate.length > 0 ? populate : undefined,
        };

        const data = await module?.findAndCountAll(queryOptions);

        if (!data) {
          throw new NotFoundException(
            `${camelCaseModel} not found!`,
            camelCaseModel,
          );
        }

        const responseData = formatPaginatedResponse(
          data.rows,
          data.count,
          page,
          limit,
          queryEcho,
        );

        successResponse(
          res,
          responseData,
          "Fetched successfully!",
          camelCaseModel,
        );
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
        successResponse(res, data, "Fetched successfully!", camelCaseModel);
      } catch (err) {
        next(err);
      }
    });
  });
};
