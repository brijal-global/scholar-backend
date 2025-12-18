import CommonEntity from "../../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const AccessTokens = sequelize.define("accessTokens", {
    ...CommonEntity,

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  AccessTokens.associate = (models) => {
    AccessTokens.belongsTo(models.users, {
      foreignKey: "id",
      as: "users",
    });
  };

  return AccessTokens;
};
