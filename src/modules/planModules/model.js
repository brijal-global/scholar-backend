import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const PlanModules = sequelize.define("planModules", {
    ...CommonEntity,

    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    monthlyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    offerName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    offerMonthlyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  });

  return PlanModules;
};
