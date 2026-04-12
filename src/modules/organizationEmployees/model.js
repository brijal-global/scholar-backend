import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const OrganizationEmployees = sequelize.define("organizationEmployees", {
    ...CommonEntity,

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    collegeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "colleges",
        key: "id",
      },
    },
    collegeCustomRoleGroupId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "collegeCustomRoleGroups",
        key: "id",
      },
    },
    designation: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    entry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    associatedModuleId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "modules",
        key: "id",
      },
    },
  });

  OrganizationEmployees.associate = (models) => {
    OrganizationEmployees.belongsTo(models.users, { foreignKey: "userId", as: "user" });
    OrganizationEmployees.belongsTo(models.colleges, { foreignKey: "collegeId", as: "college" });
    OrganizationEmployees.belongsTo(models.collegeCustomRoleGroups, { foreignKey: "collegeCustomRoleGroupId", as: "roleGroup" });
    OrganizationEmployees.belongsTo(models.modules, { foreignKey: "associatedModuleId", as: "associatedModule" });
  };

  return OrganizationEmployees;
};
