import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Inquiries = sequelize.define("inquiries", {
    ...CommonEntity,

    fullName: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(16),
      allowNull: false,
    },
    organizationName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "resolved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
    replyMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  return Inquiries;
};
