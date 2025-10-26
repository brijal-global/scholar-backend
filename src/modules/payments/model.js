import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Payments = sequelize.define("payments", {
    ...CommonEntity,

    subscriptionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "subscriptions",
        key: "id",
      },
    },
    paymentMethod: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    referenceNumber: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    attachment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  return Payments;
};
