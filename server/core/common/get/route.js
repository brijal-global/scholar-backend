import { NotFoundException } from "../../../exceptions/index.js";
import { models } from "../../../../configs/server.config.js";
import successResponse from "../../../utils/responses/successResponse.js";
import { camelCaseToHyphen } from "../../../utils/helpers/stringFormatters.js";
import { Sequelize, Op } from "sequelize";

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

        // Extract query parameters
        const {
          page = 1,
          limit = 3,
          fields = ["id"],
          search,
          searchFields = ["id"],
          status,
          dateFrom,
          dateTo,
          sortBy = "createdAt",
          sortOrder = "DESC",
          populate = [],
          conditions = {}, // like
        } = req?.query || {};

        const pageValue = parseInt(page) || 1;
        const limitValue = parseInt(limit) || 3;
        const offsetValue = parseInt((pageValue - 1) * limit) || 0;

        // Parse fields array (if provided as comma-separated string)
        const selectedFields = Array.isArray(fields)
          ? fields
          : typeof fields === "string"
            ? fields.split(",").map((f) => f.trim())
            : ["id"];

        // Parse search fields
        const searchFieldArray = Array.isArray(searchFields)
          ? searchFields
          : typeof searchFields === "string"
            ? searchFields.split(",").map((f) => f.trim())
            : ["id"];

        // Parse conditions if it's a string (from URL)
        let parsedConditions = {};
        if (typeof conditions === "string") {
          try {
            parsedConditions = JSON.parse(conditions);
          } catch (err) {
            // If parsing fails, treat it as empty object
            console.error("Failed to parse conditions:", err);
            parsedConditions = {};
          }
        } else if (typeof conditions === "object" && conditions !== null) {
          parsedConditions = conditions;
        }

        // Build WHERE clause for filtering
        const whereClause = {};
        if (Object.keys(parsedConditions).length > 0) {
          Object.keys(parsedConditions).forEach((key) => {
            whereClause[key] = parsedConditions[key];
          });
        }

        // Status filter
        if (status !== undefined) {
          whereClause.status = status;
        }

        // Date range filter
        if (dateFrom || dateTo) {
          whereClause.createdAt = {};
          if (dateFrom) {
            whereClause.createdAt[Op.gte] = new Date(dateFrom);
          }
          if (dateTo) {
            whereClause.createdAt[Op.lte] = new Date(dateTo);
          }
        }

        // Search functionality (across multiple fields)
        if (search && searchFieldArray.length > 0) {
          whereClause[Op.or] = searchFieldArray.map((field) => ({
            [field]: { [Op.like]: `%${search}%` },
          }));
        }

        // Build ORDER clause
        const orderClause = [];
        if (sortBy) {
          // Parse sortBy if it's comma-separated
          const sortFields =
            typeof sortBy === "string" ? sortBy.split(",") : [sortBy];
          const sortOrders =
            typeof sortOrder === "string" ? sortOrder.split(",") : [sortOrder];

          sortFields.forEach((field, index) => {
            const fieldName = field.trim();
            const order = sortOrders[index]?.trim().toUpperCase() || "DESC";
            orderClause.push([fieldName, order]);
          });
        }

        // If no sort specified, use defaults
        if (orderClause.length === 0) {
          orderClause.push(
            ["createdAt", "DESC"],
            ["updatedAt", "DESC"],
            ["id", "ASC"],
          );
        }

        // Build query options
        const queryOptions = {
          where: whereClause,
          offset: offsetValue,
          limit: limitValue,
          order: orderClause,
          // Only select specific fields if requested
          attributes:
            selectedFields.length > 0 && !selectedFields.includes("*")
              ? selectedFields
              : undefined,
          include: populate.length > 0 ? populate : undefined,
        };

        const data = await module?.findAndCountAll(queryOptions);

        if (!data) {
          throw new NotFoundException(
            `${camelCaseModel} not found!`,
            camelCaseModel,
          );
        }

        const responseData = {
          rows: data?.rows,
          pagination: {
            page: pageValue,
            limit: limitValue,
            totalCount: data?.count,
            totalPages: Math.ceil(data?.count / limitValue),
            hasNextPage: data?.count > limitValue * pageValue,
            hasPreviousPage: pageValue > 1,
            nextPage: pageValue + 1,
            previousPage: pageValue - 1,
            isFirstPage: pageValue === 1,
            isLastPage: pageValue === Math.ceil(data?.count / limitValue),
          },
          query: {
            fields: selectedFields,
            search: search || null,
            searchFields: searchFieldArray,
            filters: {
              status: status || null,
              dateFrom: dateFrom || null,
              dateTo: dateTo || null,
            },
            sort: {
              by: sortBy,
              order: sortOrder,
            },
          },
        };

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
