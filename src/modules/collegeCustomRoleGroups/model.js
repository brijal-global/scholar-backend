import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const CollegeCustomRoleGroups = sequelize.define("collegeCustomRoleGroups", {
    ...CommonEntity,

    collegeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "colleges",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  return CollegeCustomRoleGroups;
};
