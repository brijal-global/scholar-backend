import CommonEntity from "../../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Tokens = sequelize.define("tokens", {
    ...CommonEntity,

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    token: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
    isUsed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    type: {
      type: DataTypes.ENUM("emailVerification", "passwordReset"),
      allowNull: false,
    },
  });

  Tokens.associate = (models) => {
    Tokens.belongsTo(models.users, {
      foreignKey: "id",
      as: "users",
    });
  };

  return Tokens;
};
