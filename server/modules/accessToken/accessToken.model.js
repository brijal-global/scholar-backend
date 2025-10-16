import CommonEntity from "../../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const AccessToken = sequelize.define("accessToken", {
    ...CommonEntity,

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "user",
        key: "userId",
      },
    },
    accessToken: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });

  AccessToken.associate = (models) => {
    AccessToken.belongsTo(models.user, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
    });
  };

  return AccessToken;
};
