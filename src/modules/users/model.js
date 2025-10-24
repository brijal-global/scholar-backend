import CommonEntities from "../../../configs/common.entities.js";

const { id, ...sanitizedCommonEntities } = CommonEntities;

export default (sequelize, DataTypes) => {
  const Users = sequelize.define("users", {
    ...sanitizedCommonEntities,

    userId: { ...id },

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
      allowNull: false,
      unique: true,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    phone: {
      type: DataTypes.STRING(16),
      allowNull: true,
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

  return Users;
};
