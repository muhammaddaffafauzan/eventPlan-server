import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Event_type = db.define(
  "event_type",
  {
    type:{
        type: DataTypes.STRING,
        allowNull: false
    }
  },
  {
    freezeTableName: true,
  }
);

export default Event_type;
