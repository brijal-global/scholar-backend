import { Op } from "sequelize";
import { models, superAdminRoleId } from "./server.config.js";
import commonProtectedRoutes from "./commonProtectedRoutes.js";

const { permissions } = models;

const isUserAllowed = async (route, method, roleId) => {
  const sanitizedMethod = method.toUpperCase();
  const baseSanitizedRoute = route?.split("?")[0]?.replace(/:\w+/g, "[^/]+");

  const sanitizedRoutes = [
    baseSanitizedRoute,
    `${baseSanitizedRoute?.split("/")?.slice(0, -1)?.join("/")}`,
  ];

  console.log(1, sanitizedRoutes);

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

  console.log(2, currentRolePermittedRoutes);

  const permittedRoute = await permissions.findOne({
    where: {
      isActive: true,
      roleId,
      route: { [Op.in]: sanitizedRoutes },
      ...(sanitizedMethod === "GET" ? { canView: true } : {}),
      ...(sanitizedMethod === "POST" ? { canCreate: true } : {}),
      ...(sanitizedMethod === "PUT" ? { canUpdate: true } : {}),
      ...(sanitizedMethod === "DELETE" ? { canDelete: true } : {}),
    },
    raw: true,
  });

  if (permittedRoute?.id) return true;

  return false;
};

export { isUserAllowed };
