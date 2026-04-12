import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const ModuleMarks = sequelize.define("moduleMarks", {
    ...CommonEntity,

    examModuleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "examModules",
        key: "id",
      },
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "studentDetails",
        key: "id",
      },
    },
    obtainedMarks: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  ModuleMarks.associate = (models) => {
    ModuleMarks.belongsTo(models.examModules, { foreignKey: "examModuleId", as: "examModule" });
    ModuleMarks.belongsTo(models.studentDetails, { foreignKey: "studentId", as: "student" });
  };

  return ModuleMarks;
};
