import CommonEntities from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Users = sequelize.define("users", {
    ...CommonEntities,

    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "roles",
        key: "id",
      },
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
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
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: {
        args: true,
        msg: "Email already exists!",
      },
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    phone: {
      type: DataTypes.STRING(16),
      allowNull: {
        args: true,
        msg: "Phone number already exists!",
      },
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM,
      values: ["male", "female", "other"],
      allowNull: false,
    },
    profileImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isTermsAndConditionsAccepted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  });

  Users.associate = (models) => {
    Users.belongsTo(models.roles, {
      foreignKey: "roleId",
      as: "role",
    });
  };

  return Users;
};
