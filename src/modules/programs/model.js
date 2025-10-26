import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Programs = sequelize.define("programs", {
    ...CommonEntity,

    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    collegeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "colleges",
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
    level: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    universityName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    totalCredits: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    coverImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  return Programs;
};
