import Profile from "../models/ProfileModel.js";
import User from "../models/UsersModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Op } from "sequelize";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fungsi untuk menyimpan gambar
async function saveImage(file) {
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;

  const allowedType = [".png", ".jpg", ".jpeg"];

  if (!allowedType.includes(ext.toLowerCase())) {
    throw new Error("Invalid image");
  }

  const fileSize = file.data.length;
  if (fileSize > 2000000) {
    throw new Error("Images must be less than 2MB");
  }

  const uploadPath = path.join(__dirname, "../public/images", fileName);

  // Pastikan direktori ada
  if (!fs.existsSync(path.join(__dirname, "../public/images"))) {
    fs.mkdirSync(path.join(__dirname, "../public/images"));
  }

  await file.mv(uploadPath);

  return fileName;
}

export const getAllProfileUsers = async (req, res) => {
  try {
    const response = await Profile.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "uuid", "username", "email"],
        },
      ],
    });
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

export const getProfileUsersByUuid = async (req, res) => {
  try {
    const response = await Profile.findOne({
      where: {
        uuid: req.params.uuid,
      },
      include: [
        {
          model: User,
          attributes: ["id", "uuid", "username", "email"],
        },
      ],
    });
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

export const createOrUpdateProfile = async (req, res) => {
  try {
    const {
      username,
      firstName,
      lastName,
      phone,
      organize,
      address,
      city,
      state,
      country,
    } = req.body;

    const userRole = req.role;

    let profile = await Profile.findOne({
      where: {
        userId: req.userId,
      },
    });

    let user = await User.findOne({
      where: {
        id: req.userId,
      },
    });

    if (!profile) {
      // Jika profil belum ada, maka buat profil baru
      const file = req.files.inputFile;
      const fileName = await saveImage(file);

      profile = await Profile.create({
        userId: req.userId,
        firstName,
        lastName,
        phone,
        organize: userRole === "admin" ? "Official Eventplan" : organize,
        address: userRole === "admin" ? "Eventplan company" : address,
        city,
        state,
        country,
        image: fileName,
        url: `${req.protocol}://${req.get("host")}/images/${fileName}`,
      });

      res.status(201).json({
        message: "Profile successfully created for User",
        profile: profile,
      });
    } else {
      // Jika profil sudah ada, maka lakukan update
      let fileName = profile.image;
      if (req.files && req.files.inputFile) {
        const file = req.files.inputFile;
        fileName = await saveImage(file);
      }

      await User.update(
        {
          username: username,
        },
        {
          where: {
            id: user.id,
          },
        }
      );

      await Profile.update(
        {
          firstName,
          lastName,
          phone,
          organize: userRole === "admin" ? "Official Eventplan" : organize,
          address: userRole === "admin" ? "Eventplan company" : address,
          city,
          state,
          country,
          image: fileName,
          url: `${req.protocol}://${req.get("host")}/images/${fileName}`,
        },
        {
          where: {
            id: profile.id,
          },
        }
      );

      res.status(200).json({
        message: `Profile ${profile.firstName} ${profile.lastName} has been updated`,
        profile: profile,
      });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.error(error.message);
  }
};

export const deleteProfileImage = async (req, res) => {
 try {
   const profile = await Profile.findOne({
     where: {
       userId: req.userId,
     },
   });

   if (!profile) {
     return res.status(404).json({ msg: "Profile not found" });
   }

   // Cek apakah file gambar dimiliki oleh rekaman data profil lain
   const otherProfiles = await Profile.findAll({
     where: {
       image: profile.image,
       id: {
         [Op.ne]: profile.id,
       },
     },
   });

   if (otherProfiles.length > 0) {
     // File gambar digunakan oleh rekaman data lain, jadi hanya hapus profil dari database
     await Profile.destroy({
       where: {
         id: profile.id,
       },
     });

     return res.status(200).json({
       msg: `Profile deleted from database, but image is still in use by other profiles`,
     });
   }

   // Bangun jalur file gambar
   const imagePath = path.join(__dirname, `../public/images/${profile.image}`);

   // Hapus file gambar dari direktori jika ada
   if (fs.existsSync(imagePath) && profile.image) {
     fs.unlinkSync(imagePath); // Hapus file gambar
   }

   // Hapus referensi gambar dari profil
   await Profile.update(
     {
       image: "",
       url: "",
     },
     {
       where: {
         id: profile.id,
       },
     }
   );

   res
     .status(200)
     .json({ msg: "Profile image reference deleted successfully" });
 } catch (error) {
   console.error(error);
   res.status(500).json({ msg: error.message });
 }
};
