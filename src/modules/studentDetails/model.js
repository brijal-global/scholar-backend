import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const StudentDetails = sequelize.define("studentDetails", {
    ...CommonEntity,

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
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

  StudentDetails.associate = (models) => {
    StudentDetails.belongsTo(models.users, { foreignKey: "userId", as: "user" });
    StudentDetails.belongsTo(models.groups, { foreignKey: "groupId", as: "group" });
  };

  return StudentDetails;
};
