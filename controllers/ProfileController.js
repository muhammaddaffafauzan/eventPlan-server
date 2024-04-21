import Profile from "../models/ProfileModel.js";
import User from "../models/UsersModel.js";
import Followers from "../models/FollowersModel.js";
import { Op } from "sequelize";
import Event from "../models/EventModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
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
    // Ambil semua data profil
    const profiles = await Profile.findAll();

    // Siapkan array untuk menyimpan hasil dengan jumlah pengikut dan jumlah event
    const profilesWithCounts = [];

    // Iterasi setiap profil
    for (const profile of profiles) {
      // Hitung jumlah pengikut
      const followersCount = await Followers.count({
        where: { followingId: profile.userId },
      });

      // Hitung jumlah event yang dibuat oleh profil
      const eventCount = await Event.count({
        where: { userId: profile.userId },
      });

      // Tambahkan data profil beserta jumlah pengikut dan jumlah event ke array
      profilesWithCounts.push({
        profile,
        followersCount,
        eventCount,
      });
    }

    // Kirim response
    res.status(200).json(profilesWithCounts);
  } catch (error) {
    // Tangani error
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

export const getProfileUsersByUuid = async (req, res) => {
  try {
    // Temukan profil berdasarkan uuid
    const profile = await Profile.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });

    // Jika profil tidak ditemukan, kirim respons dengan pesan kesalahan
    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    // Hitung jumlah pengikut
    const followersCount = await Followers.count({
      where: { followingId: profile.userId },
    });

    // Hitung jumlah event yang dibuat oleh profil
    const eventCount = await Event.count({
      where: { userId: profile.userId },
    });

    // Kirim respons dengan profil beserta jumlah pengikut dan jumlah event
    res.status(200).json({
      profile,
      followersCount,
      eventCount,
    });
  } catch (error) {
    // Tangani error
    res.status(500).json({ msg: error.message });
    console.error(error.message);
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
      // If profile does not exist, create a new one
      let fileName = null; // Initialize fileName to null
      if (req.files && req.files.inputFile) {
        // Check if inputFile exists in req.files
        const file = req.files.inputFile;
        fileName = await saveImage(file); // Save the image and get the fileName
      }

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
        image: fileName, // Set the image field to fileName
        url: fileName
          ? `${req.protocol}://${req.get("host")}/images/${fileName}`
          : null, // Set the url field accordingly
      });

      res.status(201).json({
        message: "Profile successfully created for User",
        profile: profile,
      });
    } else {
      // If profile exists, update it
      let fileName = profile.image; // Initialize fileName with the existing image
      if (req.files && req.files.inputFile) {
        // Check if inputFile exists in req.files
        const file = req.files.inputFile;
        fileName = await saveImage(file); // Save the new image and get the fileName
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
          image: fileName, // Set the image field to fileName
          url: fileName
            ? `${req.protocol}://${req.get("host")}/images/${fileName}`
            : null, // Set the url field accordingly
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
    res.status(500).json({ msg: "Failed to create or update user profile" }); // Handle the error
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
