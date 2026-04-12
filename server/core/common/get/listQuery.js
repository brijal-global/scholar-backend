import { Op } from "sequelize";

function hasOwnProps(obj) {
  if (!obj || typeof obj !== "object") return false;
  return (
    Object.keys(obj).length > 0 || Object.getOwnPropertySymbols(obj).length > 0
  );
}

function stripUndefinedValues(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const cleaned = {};
  let changed = false;
  for (const key of Object.keys(obj)) {
    if (obj[key] === undefined) {
      changed = true;
    } else {
      cleaned[key] = obj[key];
    }
  }
  for (const sym of Object.getOwnPropertySymbols(obj)) {
    if (obj[sym] === undefined) {
      changed = true;
    } else {
      cleaned[sym] = obj[sym];
    }
  }
  return changed ? cleaned : obj;
}

export function mergeAndWhere(...parts) {
  const filtered = parts.filter((p) => hasOwnProps(p));
  if (filtered.length === 0) return {};
  if (filtered.length === 1) return filtered[0];
  return { [Op.and]: filtered };
}

export function buildPaginatedListQuery(query = {}, config = {}) {
  const {
    baseWhere = {},
    searchFields = [],
    buildSearchWhere,
    statusField = "status",
    defaultLimit = 10,
    maxLimit = 100,
    defaultSortBy = "createdAt",
    defaultSortOrder = "DESC",
    allowedSortFields = null,
  } = config;

  const {
    page: pageRaw = 1,
    limit: limitRaw,
    search,
    searchFields: searchFieldsFromQuery,
    status,
    dateFrom,
    dateTo,
    sortBy = defaultSortBy,
    sortOrder = defaultSortOrder,
    conditions = {},
  } = query;

  const page = Math.max(1, parseInt(String(pageRaw), 10) || 1);
  let limit = parseInt(String(limitRaw ?? defaultLimit), 10) || defaultLimit;
  if (limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;
  const offset = (page - 1) * limit;

  let parsedConditions = {};
  if (typeof conditions === "string") {
    try {
      parsedConditions = JSON.parse(conditions);
    } catch {
      parsedConditions = {};
    }
  } else if (conditions && typeof conditions === "object") {
    parsedConditions = conditions;
  }

  const effectiveSearchFields =
    searchFieldsFromQuery !== undefined && searchFieldsFromQuery !== null
      ? Array.isArray(searchFieldsFromQuery)
        ? searchFieldsFromQuery
        : String(searchFieldsFromQuery)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
      : searchFields;

  const parts = [];

  const safeBaseWhere = stripUndefinedValues(baseWhere);
  if (hasOwnProps(safeBaseWhere)) {
    parts.push(safeBaseWhere);
  }

  if (hasOwnProps(parsedConditions)) {
    parts.push(parsedConditions);
  }

  if (
    status !== undefined &&
    status !== "" &&
    status !== null &&
    String(status).toLowerCase() !== "all"
  ) {
    parts.push({ [statusField]: status });
  }

  if (dateFrom || dateTo) {
    const range = {};
    if (dateFrom) range[Op.gte] = new Date(dateFrom);
    if (dateTo) range[Op.lte] = new Date(dateTo);
    parts.push({ createdAt: range });
  }

  const searchTerm =
    search != null && String(search).trim() !== ""
      ? String(search).trim()
      : null;

  if (searchTerm) {
    if (typeof buildSearchWhere === "function") {
      parts.push(buildSearchWhere(searchTerm));
    } else if (effectiveSearchFields?.length) {
      parts.push({
        [Op.or]: effectiveSearchFields.map((field) => ({
          [field]: { [Op.like]: `%${searchTerm}%` },
        })),
      });
    }
  }

  const where = mergeAndWhere(...parts);

  const rawSortFields =
    typeof sortBy === "string"
      ? sortBy
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [sortBy].filter(Boolean);
  const rawSortOrders =
    typeof sortOrder === "string"
      ? sortOrder.split(",").map((s) => s.trim().toUpperCase())
      : [String(sortOrder).toUpperCase()];

  const order = [];
  rawSortFields.forEach((field, index) => {
    if (!field) return;
    if (allowedSortFields && !allowedSortFields.includes(field)) return;
    const ord = rawSortOrders[index] === "ASC" ? "ASC" : "DESC";
    order.push([field, ord]);
  });

  if (order.length === 0) {
    order.push([
      defaultSortBy,
      String(defaultSortOrder).toUpperCase() === "ASC" ? "ASC" : "DESC",
    ]);
  }

  const queryEcho = {
    search: searchTerm,
    searchFields: effectiveSearchFields,
    filters: {
      status:
        status !== undefined &&
        status !== "" &&
        status !== null &&
        String(status).toLowerCase() !== "all"
          ? status
          : null,
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
    },
    sort: {
      by: order.map((o) => o[0]).join(","),
      order: order.map((o) => o[1]).join(","),
    },
  };

  return { where, offset, limit, order, page, queryEcho };
}

export async function findAllPaginatedWithDistinctCount(model, options) {
  const {
    where,
    include = [],
    order,
    limit,
    offset,
    distinctCol = "id",
  } = options;

  const countOpts = {
    where,
    distinct: true,
    col: distinctCol,
  };
  if (include.length > 0) {
    countOpts.include = include;
  }

  const total = await model.count(countOpts);

  const findOpts = {
    where,
    order,
    limit,
    offset,
  };
  if (include.length > 0) {
    findOpts.include = include;
    findOpts.subQuery = true;
  }

  const rows = await model.findAll(findOpts);

  return { rows, count: total };
}

export function formatPaginatedResponse(rows, count, page, limit, queryEcho) {
  const total = typeof count === "number" ? count : 0;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    rows,
    pagination: {
      page,
      limit,
      totalCount: total,
      totalPages,
      hasNextPage: total > limit * page,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      isFirstPage: page === 1,
      isLastPage: totalPages === 0 ? true : page >= totalPages,
    },
    query: queryEcho,
  };
}
