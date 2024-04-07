import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import User from "./UsersModel.js";

const { DataTypes } = Sequelize;

const Followers = db.define(
  "followers",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    followerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    followingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    date_followed: {
      type: DataTypes.DATEONLY,
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

User.hasMany(Followers, { foreignKey: "userId", as: "userFollowers" });
Followers.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Followers, { foreignKey: "followerId", as: "userFollowing" });
Followers.belongsTo(User, { foreignKey: "followerId" });

export default Followers;