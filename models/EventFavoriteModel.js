import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import User from "./UsersModel.js";
import Event from "./EventModel.js";
import Event_loc from "./EventLocationModel.js"; // Mengimpor model Event_loc

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
    },
  },
  {
    freezeTableName: true,
  }
);

// Menambahkan relasi antara Event_fav dan Event
Event_fav.belongsTo(Event, { foreignKey: "eventId" });
Event.hasMany(Event_fav, { foreignKey: "eventId" });

// Menambahkan relasi antara Event_fav dan User
Event_fav.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Event_fav, { foreignKey: "userId" });

// Menambahkan relasi antara Event_fav dan Event_loc
Event_fav.hasMany(Event_loc, { foreignKey: "eventId" });
Event_loc.belongsTo(Event_fav, { foreignKey: "eventId" });

export default Event_fav;
