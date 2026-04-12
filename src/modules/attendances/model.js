import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Attendances = sequelize.define("attendances", {
    ...CommonEntity,

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    dateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  Attendances.associate = (models) => {
    Attendances.belongsTo(models.users, { foreignKey: "userId", as: "user" });
  };

  return Attendances;
};
