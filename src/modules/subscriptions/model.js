import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Subscriptions = sequelize.define("subscriptions", {
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
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    maxAllowedStudents: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    expiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    attachment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  });

  return Subscriptions;
};
