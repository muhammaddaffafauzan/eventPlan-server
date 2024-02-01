import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Event from "./EventModel.js";

const { DataTypes } = Sequelize;

const Event_img = db.define(
  "event_img",
  {
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    image:{
        type: DataTypes.STRING,
    },
    url:{
        type: DataTypes.STRING,
    }
  },
  {
    freezeTableName: true,
  }
);

Event.hasMany(Event_img);
Event_img.belongsTo(Event, { foreignKey: "eventId" });



export default Event_img;
