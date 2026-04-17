import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const StudentRemarks = sequelize.define("studentRemarks", {
    ...CommonEntity,

    studentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "studentDetails",
        key: "id",
      },
    },
    teacherId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    remarkType: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attachment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  StudentRemarks.associate = (models) => {
    StudentRemarks.belongsTo(models.studentDetails, { foreignKey: "studentId", as: "student" });
    StudentRemarks.belongsTo(models.users, { foreignKey: "teacherId", as: "teacher" });
  };

  return StudentRemarks;
};
