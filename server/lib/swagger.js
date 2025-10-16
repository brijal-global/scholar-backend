import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { models } from "../../configs/server.config.js";
import CommonEntities from "../../configs/common.entities.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { server } from "../../configs/env.config.js";

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const setupSwagger = (app) => {
  const allModels = Object.keys(models).filter(
    (model) => model?.toLowerCase() !== "sequelize",
  );

  // Add CORS middleware specifically for Swagger routes to ensure credentials work
  app.use("/api-docs", (req, res, next) => {
    // Enable CORS specifically for Swagger UI
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );

    // For preflight requests
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    next();
  });

  // Generate model definitions dynamically
  const modelDefinitions = {};
  const modelPaths = {};

  for (const model of allModels) {
    try {
      // Create model schema based on Sequelize model attributes
      const modelInstance = models[model];
      if (!modelInstance || !modelInstance.rawAttributes) continue;

      // Get common entity attributes dynamically from common.entities.js
      const commonAttributeKeys = [...Object.keys(CommonEntities)];

      let attributes = Object.fromEntries(
        Object.entries(modelInstance?.rawAttributes || {}).filter(
          ([key]) => !commonAttributeKeys.includes(key),
        ),
      );

      const properties = {};

      for (const [key, attr] of Object.entries(attributes)) {
        const type = mapSequelizeTypeToSwagger(
          attr.type.key || attr.type.constructor.key,
        );
        properties[key] = {
          type,
          example: getExampleForType(type),
          description: attr.comment || `The ${key} field`,
        };
      }

      // Add model schema to definitions
      modelDefinitions[model] = {
        type: "object",
        properties,
      };

      // Generate paths for each model
      modelPaths[`/${model}`] = {
        get: {
          tags: [model],
          summary: `Get all ${model} records`,
          responses: {
            200: {
              description: "Success",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "integer", example: 200 },
                      message: {
                        type: "string",
                        example: `Successfully fetched ${model}`,
                      },
                      data: {
                        type: "array",
                        items: { $ref: `#/components/schemas/${model}` },
                      },
                    },
                  },
                },
              },
            },
            500: { description: "Server Error" },
          },
        },
        post: {
          tags: [model],
          summary: `Create a new ${model} record`,
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: `#/components/schemas/${model}` },
              },
            },
          },
          responses: {
            201: {
              description: "Created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "integer", example: 201 },
                      message: {
                        type: "string",
                        example: `Successfully created ${model}`,
                      },
                      data: { $ref: `#/components/schemas/${model}` },
                    },
                  },
                },
              },
            },
            400: { description: "Bad Request" },
            500: { description: "Server Error" },
          },
        },
      };

      modelPaths[`/${model}/{id}`] = {
        get: {
          tags: [model],
          summary: `Get ${model} by ID`,
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string", format: "uuid" },
              description: `ID of the ${model} to retrieve`,
            },
          ],
          responses: {
            200: {
              description: "Success",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "integer", example: 200 },
                      message: {
                        type: "string",
                        example: `Successfully fetched ${model}`,
                      },
                      data: { $ref: `#/components/schemas/${model}` },
                    },
                  },
                },
              },
            },
            404: { description: "Not Found" },
            500: { description: "Server Error" },
          },
        },
        put: {
          tags: [model],
          summary: `Update ${model} by ID`,
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string", format: "uuid" },
              description: `ID of the ${model} to update`,
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: `#/components/schemas/${model}` },
              },
            },
          },
          responses: {
            200: {
              description: "Success",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "integer", example: 200 },
                      message: {
                        type: "string",
                        example: `Successfully updated ${model}`,
                      },
                      data: { $ref: `#/components/schemas/${model}` },
                    },
                  },
                },
              },
            },
            404: { description: "Not Found" },
            400: { description: "Bad Request" },
            500: { description: "Server Error" },
          },
        },
        delete: {
          tags: [model],
          summary: `Delete ${model} by ID`,
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: { type: "string", format: "uuid" },
              description: `ID of the ${model} to delete`,
            },
          ],
          responses: {
            200: {
              description: "Success",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      status: { type: "integer", example: 200 },
                      message: {
                        type: "string",
                        example: `Successfully deleted ${model}`,
                      },
                      data: { type: "object" },
                    },
                  },
                },
              },
            },
            404: { description: "Not Found" },
            500: { description: "Server Error" },
          },
        },
      };
    } catch (error) {
      console.error(`Error generating Swagger docs for model ${model}:`, error);
    }
  }

  // Find custom route files to document any non-dynamic routes
  const routeDirectories = ["server/core", "src/modules"];
  const customPaths = {};

  // Scan for route files and include them in Swagger docs
  const rootDir = path.resolve(__dirname, "../../");
  routeDirectories.forEach((dir) => {
    const fullPath = path.join(rootDir, dir);

    if (fs.existsSync(fullPath)) {
      findRouteFiles(fullPath, customPaths);
    }
  });

  // Define Swagger options
  const swaggerOptions = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: `${server.appName} API Documentation`,
        version: "1.0.0",
        description: `Automatically generated API documentation for ${server.appName}`,
        contact: {
          name: "API Support",
          url: "https://github.com/Pushkarcdn/neoX.js",
        },
      },
      servers: [
        {
          url: "/api",
          description: "API Server",
        },
      ],
      components: {
        schemas: modelDefinitions,
      },
      paths: {},
    },
    apis: [
      // Include route files for JSDoc comments parsing first
      path.join(rootDir, "server/core/**/*.route.js"),
      path.join(rootDir, "src/modules/**/*.route.js"),
    ],
  };

  const swaggerSpec = swaggerJsDoc(swaggerOptions);

  // Add model paths after JSDoc paths have been processed
  if (swaggerSpec.paths) {
    Object.assign(swaggerSpec.paths, modelPaths);
  } else {
    swaggerSpec.paths = modelPaths;
  }

  // Add custom CSS for styling and hiding auth elements
  const customCss = `
    .swagger-ui {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    /* Hide all authorization related elements */
    .swagger-ui .auth-wrapper,
    .swagger-ui .authorization__btn,
    .swagger-ui .authorize,
    .swagger-ui .btn.authorize,
    .swagger-ui .auth-btn-wrapper,
    .swagger-ui .auth-container,
    .swagger-ui .authorization {
      display: none !important;
    }
    
    /* Hide the lock icons next to operations */
    .swagger-ui .authorization__btn {
      display: none !important;
    }
    
    /* Clean up any remaining auth spacing */
    .swagger-ui .info {
      margin-bottom: 20px;
    }
  `;

  // Setup Swagger UI with authentication
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        responseInterceptor: (res) => {
          // Log if there were issues with the request
          if (res.status >= 400) {
            console.error("API request failed: ", res.url, res.status);
          }
          return res;
        },
      },
      customCss,
    }),
  );

  // Route to get the Swagger JSON
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.info("[Swagger]: Documentation available at /api-docs");
};

/**
 * Map Sequelize data types to Swagger data types
 * @param {string} sequelizeType - Sequelize data type
 * @returns {string} - Swagger data type
 */
function mapSequelizeTypeToSwagger(sequelizeType) {
  const typeMap = {
    STRING: "string",
    TEXT: "string",
    UUID: "string",
    UUIDV4: "string",
    UUIDV1: "string",
    INTEGER: "integer",
    BIGINT: "integer",
    FLOAT: "number",
    DOUBLE: "number",
    REAL: "number",
    DECIMAL: "number",
    BOOLEAN: "boolean",
    DATE: "string",
    DATEONLY: "string",
    TIME: "string",
    JSON: "object",
    JSONB: "object",
    ARRAY: "array",
    ENUM: "string",
    BLOB: "string",
    CITEXT: "string",
  };

  return typeMap[sequelizeType] || "string";
}

function getExampleForType(type) {
  switch (type) {
    case "string":
      return "example";
    case "integer":
      return 1;
    case "number":
      return 1.0;
    case "boolean":
      return true;
    case "object":
      return {};
    case "array":
      return [];
    default:
      return "example";
  }
}

function findRouteFiles(dir, customPaths) {
  try {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Recursively search subdirectories
        findRouteFiles(filePath, customPaths);
      } else if (file.endsWith(".route.js")) {
        // console.info(`[Swagger]: Found route file: ${filePath}`);
      }
    });
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
}
