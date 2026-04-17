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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isSystemModule: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    /* ── Legacy pricing fields (kept for data compatibility) ── */
    monthlyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    offerName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    offerMonthlyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  });

  return PlanModules;
};
