import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import User from "./UsersModel.js";

const { DataTypes } = Sequelize;

const Profile = db.define(
  "Profile",
  {
    uuid: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    organize: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    state: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false,
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

User.hasMany(Profile);
Profile.belongsTo(User, { foreignKey: "userId" });

export default Profile;