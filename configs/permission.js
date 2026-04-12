import { match } from "node-match-path";
import { models, ids } from "./server.config.js";
import commonProtectedRoutes from "./commonProtectedRoutes.js";
import generalCollegeRoutes from "./generalCollegeRoutes.js";

const { permissions } = models;

const isUserAllowed = async (route, method, roleId) => {
  const sanitizedMethod = method.toUpperCase();
  const currentSanitizedRoute = route?.split("?")[0];

  const superAdminRoleId = ids.superAdminRoleId;
  const organizationEmployeeRoleId = ids.organizationEmployeeRoleId;

  if (roleId === superAdminRoleId) return true;

  if (roleId === organizationEmployeeRoleId) {
    const isCollegeRoute = generalCollegeRoutes.some((item) => {
      const { matches } = match(item.route, currentSanitizedRoute);
      const isMethodMatch = item.methods.includes(sanitizedMethod);
      return matches && isMethodMatch;
    });

    if (isCollegeRoute) return true;
  }

  const isCommonProtectedRoute = commonProtectedRoutes.some((item) => {
    const normalizedMethods = item.methods.map((method) =>
      method.toUpperCase(),
    );

    const routePattern = new RegExp(
      `^${item.route.replace(/:\w+/g, "[^/]+")}$`,
      "i",
    );

    return (
      routePattern.test(route) &&
      normalizedMethods.includes(sanitizedMethod)
    );
  });

  if (isCommonProtectedRoute) return true;

  const currentRolePermittedRoutes = await permissions.findAll({
    where: {
      isActive: true,
      roleId,
      ...(sanitizedMethod === "GET" ? { canView: true } : {}),
      ...(sanitizedMethod === "POST" ? { canCreate: true } : {}),
      ...(sanitizedMethod === "PUT" ? { canUpdate: true } : {}),
      ...(sanitizedMethod === "DELETE" ? { canDelete: true } : {}),
    },
    attributes: ["route"],
    raw: true,
  });

  const isPermittedRoute = !!currentRolePermittedRoutes.some((item) => {
    const baseRoute = item?.route;
    const expandedRoute = `${baseRoute}/:identifier`;

    const { matches: baseMatches } = match(baseRoute, currentSanitizedRoute);

    const { matches: expandedMatches } = match(
      expandedRoute,
      currentSanitizedRoute,
    );

    return baseMatches || expandedMatches;
  });

  return isPermittedRoute;
};

export { isUserAllowed };
