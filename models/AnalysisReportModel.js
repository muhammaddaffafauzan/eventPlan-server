// EventReportModel.js
import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import User from "./UsersModel.js";
import Event from "./EventModel.js";

const { DataTypes } = Sequelize;

const EventReport = db.define(
  "event_reports",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    eventId: {
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
    reportDate: {
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

EventReport.belongsTo(User, { foreignKey: "userId" });
EventReport.belongsTo(Event, { foreignKey: "eventId" });

export default EventReport;