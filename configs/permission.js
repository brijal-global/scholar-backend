import { Op } from "sequelize";
import { models } from "./server.config.js";
import commonProtectedRoutes from "./commonProtectedRoutes.js";

const { roles, permissions } = models;

const isUserAllowed = async (route, method, roleId) => {
  console.log(0, route, method, roleId);

  const sanitizedMethod = method.toUpperCase();
  const baseSanitizedRoute = route?.split("?")[0]?.replace(/:\w+/g, "[^/]+");

  const sanitizedRoutes = [baseSanitizedRoute, `${baseSanitizedRoute}/:id`];

  const role = await roles.findByPk(roleId, {
    attributes: ["id", "name"],
    raw: true,
  });

  if (!role) return false;

  if (role?.name === "superAdmin") return true;

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

  console.log(1, baseSanitizedRoute);
  console.log(2, sanitizedRoutes);

  const isRouteMatch = sanitizedRoutes.some((routeItem) => {
    const routePattern = new RegExp(
      `^${routeItem.replace(/:\w+/g, "[^/]+")}$`,
      "i", // Case-insensitive
    );
    return routePattern.test(routeItem);
  });

  console.log(3, isRouteMatch);

  if (isRouteMatch) {
    console.log(4, "Inside isRouteMatch");

    const permittedRoute = await permissions.findOne({
      where: {
        isActive: true,
        roleId,
        route: baseSanitizedRoute,
        ...(sanitizedMethod === "GET" ? { canView: true } : {}),
        ...(sanitizedMethod === "POST" ? { canCreate: true } : {}),
        ...(sanitizedMethod === "PUT" ? { canUpdate: true } : {}),
        ...(sanitizedMethod === "DELETE" ? { canDelete: true } : {}),
      },
      raw: true,
    });

    console.log(5, permittedRoute);

    if (permittedRoute?.id) return true;
  }

  return false;
};

export { isUserAllowed };
