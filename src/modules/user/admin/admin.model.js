import CommonEntity from "../../../../configs/common.entities.js";

export const oAuthProviders = [""];

export default (sequelize, DataTypes) => {
  const Admin = sequelize.define("admin", {
    ...CommonEntity,

    userId: {
      type: DataTypes.UUID,
      references: {
        model: "user",
        key: "userId",
      },
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: {
        args: true,
        msg: "Email already exists!",
      },
    },
    phone: {
      type: DataTypes.STRING(16),
      allowNull: false,
      unique: {
        args: true,
        msg: "Phone already exists!",
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profileImage: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
  });

  Admin.associate = (models) => {
    Admin.belongsTo(models.user, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return Admin;
};
