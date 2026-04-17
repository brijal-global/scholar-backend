import CommonEntity from "../../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const RefreshTokens = sequelize.define("refreshTokens", {
    ...CommonEntity,

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    refreshToken: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
  });

  RefreshTokens.associate = (models) => {
    RefreshTokens.belongsTo(models.users, {
      foreignKey: "userId",
      as: "user",
    });
  };

  return RefreshTokens;
};
