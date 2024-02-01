import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
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

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'storage/images'); // Ganti direktori penyimpanan sesuai kebutuhan Anda
  },
  filename: function (req, file, cb) {
    // Logika penamaan file sesuai kebutuhan Anda
    cb(null, file.fieldname + '-' + Date.now());
  },
});

const upload = multer({ storage: storage });

app.use(cors({
  origin: '',
  credentials: true,
}));

app.use(express.json());
app.use(cors());
app.use(upload.any());
app.use(UsersRoute);
app.use(AuthRoute);
app.use(EventRoute);
app.use(FollowersRoute);
app.use(ProfileRoute);
app.use(EventTypesRoutes);
app.use(EventCategoriesRoutes);

app.listen(process.env.APP_PORT, () => {
  console.log('Server Up And Running...');
});
