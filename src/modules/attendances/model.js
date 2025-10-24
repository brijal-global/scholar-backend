import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Attendances = sequelize.define("attendances", {
    ...CommonEntity,

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "userId",
      },
    },
    dateTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  return Attendances;
};
