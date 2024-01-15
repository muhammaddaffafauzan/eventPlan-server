import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Event from "./EventModel.js";

const { DataTypes } = Sequelize;

const Event_check = db.define(
  "event_checklist",
  {
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    item:{
        type: DataTypes.STRING,
        allowNull: false
    },
    status:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0
    },
    date_added:{
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    date_updated:{
        type: DataTypes.DATEONLY,
        allowNull: false
    }
  },
  {
    freezeTableName: true,
  }
);

Event.hasMany(Event_check);
Event_check.belongsTo(Event, { foreignKey: "eventId" });



export default Event_check;
