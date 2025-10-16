import fs from "fs";
import path from "path";

const commonProtectedRoutes = [
  {
    methods: ["GET"],
    route: "/api/auth/me",
  },
  {
    methods: ["POST"],
    route: "/api/auth/refresh",
  },
  {
    methods: ["PUT"],
    route: "/api/auth/update-my-profile",
  },
  {
    methods: ["PUT"],
    route: "/api/auth/change-my-password",
  },
];

const isUserAllowed = async (route, method, userType) => {
  if (userType === "superAdmin") return true;

  const permissionsPath = path.resolve(
    `src/modules/user/${userType}/${userType}.permissions.js`,
  );

  if (!fs.existsSync(permissionsPath)) {
    console.error(`Permissions are not specified for user type: ${userType}.`);
    return false;
  }

  const allowedRoutes = (await import(permissionsPath))?.default;

  allowedRoutes.push(...commonProtectedRoutes);

  if (!allowedRoutes) return false;

  // Check if the route and method match
  const isMatch = allowedRoutes.some((item) => {
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
      normalizedMethods.includes(method.toUpperCase()) // Check if the method is allowed
    );
  });

  if (!isMatch) {
    console.error(
      `User is not authorized to access this resource. [userType: ${userType}] route: ${route} [${method}]`,
    );
  }
  return isMatch;
};

export { isUserAllowed };
