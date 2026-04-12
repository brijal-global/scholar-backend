import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Batches = sequelize.define("batches", {
    ...CommonEntity,

    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    programId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "programs",
        key: "id",
      },
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    countryImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  Batches.associate = (models) => {
    Batches.belongsTo(models.programs, { foreignKey: "programId", as: "program" });
  };

  return Batches;
};
