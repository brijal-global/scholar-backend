import CommonEntity from "../../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Permissions = sequelize.define("permissions", {
    ...CommonEntity,

    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "roles",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    route: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    canView: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    canUpdate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    canCreate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    canDelete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  });

  return Permissions;
};
