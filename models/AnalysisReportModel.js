import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Event from "./EventModel.js";
import User from "./UsersModel.js";

const { DataTypes } = Sequelize;

const AnalysisReport = db.define(
  "analysis_reports",
  {
    reportId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    overallRating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    comments: {
      type: DataTypes.JSONB, 
      allowNull: true,
    },
    suggestions: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    analysisDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    freezeTableName: true,
  }
);


AnalysisReport.belongsTo(Event, { foreignKey: "eventId" });
AnalysisReport.belongsTo(User, { foreignKey: "userId" });

export default AnalysisReport;
