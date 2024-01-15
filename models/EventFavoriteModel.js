import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import User from "./UsersModel.js";
import Event from "./EventModel.js";

const { DataTypes } = Sequelize;

const Event_fav = db.define(
  "event_favorite",
  {
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
    }
  },
  {
    freezeTableName: true,
  }
);

Event.hasMany(Event_favorite);
Event_favorite.belongsTo(Event, { foreignKey: "eventId" });

User.hasMany(Event_favorite);
Event_favorite.belongsTo(User, { foreignKey: "userId" });

export default Event_fav;
