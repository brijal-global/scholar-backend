import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Exams = sequelize.define("exams", {
    ...CommonEntity,

    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
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
  });

  return Exams;
};
