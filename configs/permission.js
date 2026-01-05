import { match } from "node-match-path";
import { models, superAdminRoleId } from "./server.config.js";
import commonProtectedRoutes from "./commonProtectedRoutes.js";

const { permissions } = models;

const isUserAllowed = async (route, method, roleId) => {
  const sanitizedMethod = method.toUpperCase();
  const currentSanitizedRoute = route?.split("?")[0];

  if (roleId === superAdminRoleId) return true;

  // Check if the route and method match
  const isCommonProtectedRoute = commonProtectedRoutes.some((item) => {
    const normalizedMethods = item.methods.map((method) =>
      method.toUpperCase(),
    );

    // Convert dynamic route patterns like `/api/testimonials/:id` into a regex
    const routePattern = new RegExp(
      `^${item.route.replace(/:\w+/g, "[^/]+")}$`,
      "i", // Case-insensitive
    );

    return (
      routePattern.test(route) && // Check if the route matches the pattern
      normalizedMethods.includes(sanitizedMethod) // Check if the method is allowed
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
