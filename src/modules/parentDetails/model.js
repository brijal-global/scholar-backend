import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const ParentDetails = sequelize.define("parentDetails", {
    ...CommonEntity,

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "studentDetails",
        key: "id",
      },
    },
    relation: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
  });

  return ParentDetails;
};
