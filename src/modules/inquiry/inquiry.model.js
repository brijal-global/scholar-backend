import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Inquiry = sequelize.define("inquiry", {
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
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
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

  return Inquiry;
};
