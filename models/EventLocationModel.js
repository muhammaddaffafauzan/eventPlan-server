import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Event from "./EventModel.js";

const { DataTypes } = Sequelize;

const Event_loc = db.define(
  "event_location",
  {
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    city:{
        type: DataTypes.STRING,
        allowNull: false
    },
    state:{
        type: DataTypes.STRING,
        allowNull: false
    },
    country:{
        type: DataTypes.STRING,
        allowNull: false
    },
    address:{
        type: DataTypes.STRING,
        allowNull: false
    },
    lat:{
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    long:{
        type: DataTypes.DOUBLE,
        allowNull: false
    }
  },
  {
    freezeTableName: true,
  }
);

Event.hasMany(Event_loc);
Event_loc.belongsTo(Event, { foreignKey: "eventId" });



export default Event_loc;
