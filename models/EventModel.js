import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Event = db.define(
  "events",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    organizer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    type_location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    technical: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    admin_validation: {
      type: DataTypes.ENUM('Menunggu Validasi', 'Disetujui', 'Ditolak'),
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

User.hasMany(Event);
Event.belongsTo(User, { foreignKey: "userId" });

export default Event;
