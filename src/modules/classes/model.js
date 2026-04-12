import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Classes = sequelize.define("classes", {
    ...CommonEntity,

    moduleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "modules",
        key: "id",
      },
    },
    groupId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "groups",
        key: "id",
      },
    },
    isWeekly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  });

  Classes.associate = (models) => {
    Classes.belongsTo(models.modules, { foreignKey: "moduleId", as: "module" });
    Classes.belongsTo(models.groups, { foreignKey: "groupId", as: "group" });
  };

  return Classes;
};
