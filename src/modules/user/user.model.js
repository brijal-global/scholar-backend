export default (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userType: {
      type: DataTypes.ENUM,
      values: ["superAdmin", "admin", "seller", "buyer"],
      allowNull: false,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  return User;
};
