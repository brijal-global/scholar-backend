import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Product = sequelize.define("product", {
    ...CommonEntity,

    sellerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "seller",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    originLocation: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    coverImages: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  });

  return Product;
};
