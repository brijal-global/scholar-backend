import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const CollegeCustomRolePermissions = sequelize.define(
    "collegeCustomRolePermissions",
    {
      ...CommonEntity,

      collegeCustomRoleGroupId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "collegeCustomRoleGroups",
          key: "id",
        },
      },
      subscribedModuleId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "subscribedModules",
          key: "id",
        },
      },
      canView: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      canEdit: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      canCreate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      canDelete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
  );

  return CollegeCustomRolePermissions;
};
