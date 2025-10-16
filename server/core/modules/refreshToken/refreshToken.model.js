import CommonEntity from "../../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define("refreshToken", {
    ...CommonEntity,

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "user",
        key: "userId",
      },
    },
    refreshToken: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
    timesUsed: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
  });

  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.user, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return RefreshToken;
};
