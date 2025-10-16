import CommonEntity from "../../../configs/common.entities.js";

export default (sequelize, DataTypes) => {
  const Faq = sequelize.define("faq", {
    ...CommonEntity,

    question: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  return Faq;
};
