import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const StudentDetails = sequelize.define("studentDetails", {
    ...CommonEntity,

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "userId",
      },
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "groups",
        key: "id",
      },
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  });

  return StudentDetails;
};
