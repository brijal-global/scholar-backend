import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Colleges = sequelize.define("colleges", {
    ...CommonEntity,

    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    collegeType: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    streetAddress: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    logo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    coverImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isAttendanceClassBased: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  });

  return Colleges;
};
