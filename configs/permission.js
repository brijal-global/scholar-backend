import { models } from "./server.config.js";
import commonProtectedRoutes from "./commonProtectedRoutes.js";

const { roles, permissions } = models;

const isUserAllowed = async (route, method, roleId) => {
  const sanitizedRoute = route.replace(/:\w+/g, "[^/]+");
  const sanitizedMethod = method.toUpperCase();

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

  const permittedRoute = await permissions.findOne({
    where: {
      roleId,
      route: sanitizedRoute,
      ...(sanitizedMethod === "GET" ? { canView: true } : {}),
      ...(sanitizedMethod === "POST" ? { canCreate: true } : {}),
      ...(sanitizedMethod === "PUT" ? { canUpdate: true } : {}),
      ...(sanitizedMethod === "DELETE" ? { canDelete: true } : {}),
    },
    raw: true,
  });

  if (permittedRoute) return true;

  return false;
};

export { isUserAllowed };
