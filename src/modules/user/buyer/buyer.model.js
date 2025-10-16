import CommonEntity from "../../../../configs/common.entities.js";

export const oAuthProviders = ["google", "linkedin"];

export default (sequelize, DataTypes) => {
  const Buyer = sequelize.define("buyer", {
    ...CommonEntity,

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "user",
        key: "userId",
      },
    },
    firstName: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    profession: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(128),
      allowNull: false,
      unique: {
        args: true,
        msg: "Email already exists!",
      },
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(16),
      allowNull: true,
      unique: {
        args: true,
        msg: "Phone already exists!",
      },
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "others"),
      allowNull: true,
    },
    profileImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    oAuthProvider: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    oAuthId: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isTermsAndConditionsAccepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  Buyer.associate = (models) => {
    Buyer.belongsTo(models.user, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return Buyer;
};
