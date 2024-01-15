import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Event_category = db.define(
  "event_category",
  {
    category:{
        type: DataTypes.STRING,
        allowNull: false
    }
  },
  {
    freezeTableName: true,
  }
);

export default Event_category;
