import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const ExamModules = sequelize.define("examModules", {
    ...CommonEntity,

    examId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "exams",
        key: "id",
      },
    },
    moduleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "modules",
        key: "id",
      },
    },
    examType: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    totalMarks: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  });

  ExamModules.associate = (models) => {
    ExamModules.belongsTo(models.exams, { foreignKey: "examId", as: "exam" });
    ExamModules.belongsTo(models.modules, { foreignKey: "moduleId", as: "module" });
  };

  return ExamModules;
};
