import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";

export default async (router) => {
  const routeDirectories = ["server/core", "src/modules"];

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

  // Import and attach routes
  await (async () => {
    try {
      await Promise.all(
        routes.map(async (filePath) => {
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
        }),
      );
    } catch (err) {
      console.error("Error loading routes:", err);
    }
  })();

  return router;
};
