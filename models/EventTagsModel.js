import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Event from "./EventModel.js";

const { DataTypes } = Sequelize;

const Event_tags = db.define(
  "event_tags",
  {
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    freezeTableName: true,
  }
);

Event.hasMany(Event_tags);
Event_tags.belongsTo(Event, { foreignKey: "eventId" });

export default Event_tags;
