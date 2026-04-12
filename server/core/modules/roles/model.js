import CommonEntity from "../../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Roles = sequelize.define("roles", {
    ...CommonEntity,

    name: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: {
        args: true,
        msg: "Role already exists!",
      },
    },
    slug: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  return Roles;
};
