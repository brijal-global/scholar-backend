import pg from "pg";
import { sync } from "glob";
import cls from "cls-hooked";
import { Sequelize } from "sequelize";
import isIterable from "../utils/validation/isIterable.js";
import { postgres, database } from "../../configs/env.config.js";

import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize namespace for transaction management
const namespace = cls.createNamespace("transactional");

Sequelize.useCLS(namespace);

// Initialize Sequelize with connection details
const sequelize = new Sequelize(
  postgres.database,
  postgres.user,
  postgres.password,
  {
    dialectModule: pg,
    host: postgres.host,
    port: postgres.port,
    dialect: database.dialect,
    dialectOptions: {
      ssl:
        postgres.ssl === "true"
          ? {
              require: true,
              rejectUnauthorized: false,
              ca: postgres.ca,
            }
          : false,
    },
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: false,
      freezeTableName: true,
      hooks: {
        beforeCreate(instance, options) {
          if (options.id) {
            instance.createdBy = instance.createdBy || options.id;
            instance.updatedBy = instance.updatedBy || options.id;
          }
        },
        beforeBulkCreate(instances, options) {
          if (isIterable(instances)) {
            instances.forEach((instance) => {
              if (options.id) {
                instance.createdBy = instance.createdBy || options.id;
                instance.updatedBy = instance.updatedBy || options.id;
              }
            });
          }
        },
        beforeUpdate(instance, options) {
          if (options.id) {
            instance.updatedBy = options.id;
          }
        },
        beforeBulkUpdate(instances, options) {
          if (isIterable(instances)) {
            instances.forEach((instance) => {
              if (options.id) {
                instance.updatedBy = options.id;
              }
            });
          }
        },
      },
    },
  },
);

// Load all model files and initialize models
// Convert paths to use forward slashes for cross-platform glob compatibility
const moduleModels = sync(
  path.join(__dirname, "../../src/modules/**/model.js").replace(/\\/g, "/"),
);
const coreModels = sync(
  path.join(__dirname, "../../server/core/**/model.js").replace(/\\/g, "/"),
);

const allModels = [...moduleModels, ...coreModels];

const db = {};

const loadModels = async () => {
  for (const modelFile of allModels) {
    try {
      // Convert to file URL for cross-platform ESM import compatibility
      const fileUrl = pathToFileURL(modelFile).href;
      const importedModel = await import(fileUrl);

      if (!importedModel.default) {
        console.error(
          `⚠️ Model file ${modelFile} does not export a default function.`,
        );
        continue;
      }

      const model = importedModel.default(sequelize, Sequelize.DataTypes);

      if (!model || !model.name) {
        console.error(
          `⚠️ Model from ${modelFile} did not initialize correctly.`,
        );
        continue;
      }

      // console.info(`Model Loaded: ${model.name}`);
      db[model.name] = model;
    } catch (error) {
      console.error(`Error loading model file :: ${modelFile}`, error);
    }
  }

  // Setup model associations
  Object.keys(db).forEach((modelName) => {
    if (typeof db[modelName].associate === "function") {
      db[modelName].associate(db);
    }
  });

  console.info("Models Loaded:", Object.keys(db), "");
};

await loadModels();

// Export initialized Sequelize instance and models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
