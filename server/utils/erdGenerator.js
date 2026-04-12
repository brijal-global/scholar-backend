/**
 * Generate JSON representation of models
 * @param {Object} db - Database object containing all models
 * @returns {Object} JSON representation with tables and relationships
 */
export const generateModelJSON = (db) => {
  const result = {
    tables: [],
    relationships: [],
  };

  const processedRelationships = new Set();

  Object.keys(db).forEach((modelName) => {
    const model = db[modelName];

    if (
      !model.rawAttributes ||
      modelName === "sequelize" ||
      modelName === "Sequelize"
    ) {
      return;
    }

    const table = {
      name: model.tableName,
      modelName: modelName,
      attributes: [],
    };

    Object.keys(model.rawAttributes).forEach((attrName) => {
      const attr = model.rawAttributes[attrName];
      table.attributes.push({
        name: attrName,
        type: attr.type.constructor.key || attr.type.key || "STRING",
        primaryKey: attr.primaryKey || false,
        allowNull: attr.allowNull !== false,
        unique: attr.unique || false,
        defaultValue: attr.defaultValue,
        references: attr.references
          ? {
              model: attr.references.model,
              key: attr.references.key,
            }
          : null,
      });
    });

    result.tables.push(table);
  });

  // Add relationships
  Object.keys(db).forEach((modelName) => {
    const model = db[modelName];

    if (
      !model.associations ||
      modelName === "sequelize" ||
      modelName === "Sequelize"
    ) {
      return;
    }

    Object.keys(model.associations).forEach((assocName) => {
      const assoc = model.associations[assocName];
      const sourceTable = assoc.source.tableName;
      const targetTable = assoc.target.tableName;

      const relKey = `${sourceTable}-${targetTable}-${assoc.associationType}`;
      const reverseRelKey = `${targetTable}-${sourceTable}`;

      if (
        processedRelationships.has(relKey) ||
        processedRelationships.has(reverseRelKey)
      ) {
        return;
      }

      result.relationships.push({
        type: assoc.associationType,
        source: sourceTable,
        target: targetTable,
        as: assoc.as,
        foreignKey: assoc.foreignKey,
      });

      processedRelationships.add(relKey);
    });
  });

  return result;
};
