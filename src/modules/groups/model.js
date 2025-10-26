import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Groups = sequelize.define("groups", {
    ...CommonEntity,

    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    batchId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "batches",
        key: "id",
      },
    },
    supervisorId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "userId",
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
    coverImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  return Groups;
};
