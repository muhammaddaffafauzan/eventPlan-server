import { Sequelize } from "sequelize";

const db = new Sequelize('eventplan_db', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: console.log,
  });  

export default db;