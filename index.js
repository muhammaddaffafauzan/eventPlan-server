import express from "express";
import FileUpload from "express-fileupload";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/Database.js";
import UsersRoute from "./routes/UsersRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import EventRoute from "./routes/EventRoute.js";
import FollowersRoute from "./routes/FollowersRoute.js";
import ProfileRoute from "./routes/ProfileRoute.js";
import EventTypesRoutes from "./routes/EventTypesRoutes.js";
import EventCategoriesRoutes from "./routes/EventCategoriesRoutes.js";

dotenv.config();

const app = express();

try {
    await db.authenticate();
    console.log('Database Connected...');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
  
  // (async () => {
  //   await db.sync();
  //   console.log('Database synchronized...');
  // })();
  
 app.use(cors({
    origin: '',
    credentials: true,
}));

app.use(express.json());
app.use(express.static("public"));
app.use(FileUpload());
app.use(cors());
app.use(UsersRoute);
app.use(AuthRoute);
app.use(EventRoute);
app.use(FollowersRoute);
app.use(ProfileRoute);
app.use(EventTypesRoutes);
app.use(EventCategoriesRoutes);

app.listen(process.env.APP_PORT, ()=>{
    console.log('Server Up And Running...')
});