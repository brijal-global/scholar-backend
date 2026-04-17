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
      planModuleId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "planModules",
          key: "id",
        },
      },
      subscribedModuleId: {
        type: DataTypes.UUID,
        allowNull: true,
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

  CollegeCustomRolePermissions.associate = (models) => {
    CollegeCustomRolePermissions.belongsTo(models.collegeCustomRoleGroups, {
      foreignKey: "collegeCustomRoleGroupId",
      as: "roleGroup",
    });
    CollegeCustomRolePermissions.belongsTo(models.planModules, {
      foreignKey: "planModuleId",
      as: "planModule",
    });
    if (models.subscribedModules) {
      CollegeCustomRolePermissions.belongsTo(models.subscribedModules, {
        foreignKey: "subscribedModuleId",
        as: "subscribedModule",
      });
    }
  };

  return CollegeCustomRolePermissions;
};
