import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Testimonial = sequelize.define("testimonial", {
    ...CommonEntity,

    fullName: {
      type: DataTypes.STRING(126),
      allowNull: false,
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    profession: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    profileImage: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    companyLogo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  return Testimonial;
};
