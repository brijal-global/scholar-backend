import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Modules = sequelize.define("modules", {
    ...CommonEntity,

    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    programId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "programs",
        key: "id",
      },
    },
    code: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    credits: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    coverImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  Modules.associate = (models) => {
    Modules.belongsTo(models.programs, { foreignKey: "programId", as: "program" });
  };

  return Modules;
};
