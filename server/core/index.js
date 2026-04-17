import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";

export default async (router) => {
  // src/modules routes must be collected first so their handlers are registered
  // before the generic catch-all handlers in server/core/common (get/post/put/delete).
  // Express matches routes in registration order, so custom routes must come first.
  const routeDirectories = ["src/modules", "server/core"];

  let routes = [];

  const getRouteFiles = (dir) => {
    const filesAndFolders = fs.readdirSync(dir);

    filesAndFolders.forEach((entry) => {
      const fullPath = path.join(dir, entry);
      if (fs.statSync(fullPath).isDirectory()) {
        getRouteFiles(fullPath); // Recursive call for nested folders
      } else if (entry === "route.js") {
        routes.push(fullPath);
      }
    });
  };

  // Start collecting routes
  routeDirectories.forEach((dir) => {
    const fullPath = path.resolve(dir);
    getRouteFiles(fullPath);
  });

  // Log all routes
  console.info("Routes detected: ", routes);

  // Import and attach routes sequentially to guarantee registration order.
  // Using Promise.all would cause non-deterministic registration order because
  // microtask resolution order is not guaranteed across concurrent imports.
  for (const filePath of routes) {
    try {
      const fileUrl = pathToFileURL(filePath).href;
      const module = await import(fileUrl);
      if (typeof module.default === "function") {
        module.default(router);
      } else {
        console.error(`\nError loading route: ${filePath}`);
      }
    } catch (error) {
      console.error(`\nError loading route: ${filePath}`, error);
    }
  }

  return router;
};
