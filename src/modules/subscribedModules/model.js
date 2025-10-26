import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const SubscribedModules = sequelize.define("subscribedModules", {
    ...CommonEntity,

    subscriptionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "subscriptions",
        key: "id",
      },
    },
    planModuleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "planModules",
        key: "id",
      },
    },
    finalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  });

  return SubscribedModules;
};
