import Profile from "../models/ProfileModel.js";
import User from "../models/UsersModel.js";
import bcryptjs from "bcryptjs";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

export const createProfileAndUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      confPassword,
      firstName,
      lastName,
      phone,
      organize,
      address,
      city,
      state,
      country,
    } = req.body;

    if (password !== confPassword) {
      return res
        .status(400)
        .json({ message: "Password and Confirmation Password does not match" });
    }

    const file = req.files.inputFile;

    if (!file) {
      return res.status(400).json({ msg: "No File Uploaded" });
    }

    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowedType = [".png", ".jpg", "jpeg"];

    if (!allowedType.includes(ext.toLocaleLowerCase())) {
      return res.status(422).json({ msg: "Invalid Image" });
    }

    if (fileSize > 2000000) {
      return res.status(422).json({ msg: "Image must be less than 2MB" });
    }

    file.mv(`../public/images/${fileName}`, async (err) => {
      if (err) return res.status(500).json({ msg: err.message });
    });

    const newUser = await User.create({
      username,
      email,
      password: await bcryptjs.hash(password, await bcryptjs.genSalt()),
      role: "user",
    });

    const newProfile = await Profile.create({
      userId: newUser.id,
      firstName,
      lastName,
      phone,
      organize,
      address,
      city,
      state,
      country,
      image: fileName,
      url: url,
    });

    res.status(201).json({
      message: "Register success",
      profile: newProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

export const updateProfileUser = async (req, res) => {
  const profile = await Profile.findOne({
    where: {
      userId: req.userId,
    },
  });

  if (!profile) {
    return res.status(404).json({ msg: "Data not found" });
  }

  let fileName = "";

  if (req.files === null || req.files.inputFile === undefined) {
    fileName = profile.image;
  } else {
    const file = req.files.inputFile;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    fileName = file.md5 + ext;

    const allowedType = [".png", ".jpg", ".jpeg"];

    if (!allowedType.includes(ext.toLowerCase())) {
      return res.status(422).json({ msg: "Invalid image" });
    }

    if (fileSize > 2000000) {
      return res.status(422).json({ msg: "Images must be less than 2MB" });
    }

    const filepath = `../public/images/${profile.image}`;

    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath);
        console.log(`File ${filepath} successfully deleted`);
      } catch (err) {
        console.error(`Failed to delete file ${filepath}: ${err}`);
      }
    } else {
      console.warn(`File ${filepath} not found`);
    }

    file.mv(`../public/images/${fileName}`, (err) => {
      if (err) {
        console.error(`Error moving file: ${err}`);
        return res.status(500).json({ msg: "Error moving file" });
      }
    });

    console.log("file:", file); // Cek apakah file terdeteksi
    console.log("fileName:", fileName); // Cek apakah fileName sesuai

    file.mv(`../public/images/${fileName}`, (err) => {
      if (err) return res.status(500).json({ msg: err.message });
    });
  }

  const {
    firstName,
    lastName,
    phone,
    organize,
    address,
    city,
    state,
    country,
  } = req.body;

  try {
    await Profile.update(
      {
        firstName,
        lastName,
        phone,
        organize,
        address,
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

    res.status(201).json({
      message: `Profile ${profile.firstName} ${profile.lastName} has updated`,
    });
  } catch (error) {
    res.status(501).json({ msg: error.message });
    console.log(error.message);
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

    console.log(profile.image)

    const fileName = profile.image;
    const imagePath = path.join(__dirname, '../public/images/', fileName);    

    if (!fs.existsSync(imagePath)) {
      console.warn(`File ${fileName} not found at ${imagePath}`);
      return res.status(404).json({ msg: "Profile image not found" });
    }

    // Hapus file gambar profil
    fs.unlinkSync(imagePath);
    console.log(`File ${fileName} successfully deleted`);

    // Gantikan dengan foto nama inisial
    const initialsImageFileName = `${profile.firstName.charAt(0).toUpperCase()}.jpg`;
    const initialsImagePath = path.join(__dirname, '../public/images/', initialsImageFileName);

    // Mengubah ukuran gambar menjadi sangat kecil
    const resizedImageBuffer = await sharp(initialsImagePath)
      .resize({ width: 50, height: 50, fit: 'cover', position: 'center' })
      .jpeg({ quality: 70, progressive: true })
      .toBuffer();

    // Validasi ukuran file setelah mengubah ukuran gambar
    if (resizedImageBuffer.length > 100000) {
      const adjustedQuality = Math.floor((100000 / resizedImageBuffer.length) * 70);
      const finalResizedImageBuffer = await sharp(initialsImagePath)
        .resize({ width: 50, height: 50, fit: 'cover', position: 'center' })
        .jpeg({ quality: adjustedQuality, progressive: true })
        .toBuffer();

      fs.writeFileSync(initialsImagePath, finalResizedImageBuffer);
    } else {
      fs.writeFileSync(initialsImagePath, resizedImageBuffer);
    }

    // Update record dalam tabel Profile dengan foto profil baru
    await Profile.update(
      {
        image: initialsImageFileName,
        url: `${req.protocol}://${req.get("host")}/images/${initialsImageFileName}`,
      },
      {
        where: {
          id: profile.id,
        },
      }
    );

    res.status(200).json({ msg: "Profile image deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

export const createProfileForAdmin = async (req, res) => {
  try {
    const { userId, firstName, lastName, city, state, country } = req.body;

    if (req.files === null || req.files.inputFile === undefined)
      return res.status(400).json({ msg: "No File Uploaded" });

    const file = req.files.inputFile;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowedType = [".png", ".jpg", "jpeg"];

    if (!allowedType.includes(ext.toLocaleLowerCase())) {
      return res.status(422).json({ msg: "Invalid Image" });
    }

    if (fileSize > 2000000) {
      return res.status(422).json({ msg: "Image must be less than 2MB" });
    }

    const imagePath = path.join(__dirname, "../public/images/", fileName);

    file.mv(imagePath, async (err) => {
      if (err) return res.status(500).json({ msg: err.message });
    });

    const newProfile = await Profile.create({
      userId: req.userId,
      firstName,
      lastName,
      phone: "",
      organize: "Official Eventplan",
      address: "Eventplan company",
      city,
      state,
      country,
      image: fileName,
      url: url,
    });

    res.status(201).json({
      message: "Profile successfully created for admin",
      profile: newProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

export const updateProfileForAdmin = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      where: {
        userId: req.userId,
      },
    });

    if (!profile) {
      return res.status(404).json({ msg: "Data not found" });
    }

    // Pemeriksaan apakah pengguna yang mengupdate profil adalah admin
    if (req.role !== "admin") {
      return res.status(403).json({ msg: "Only admin can update profiles" });
    }

    let fileName = "";

    if (req.files === null || req.files.inputFile === undefined) {
      fileName = profile.image;
    } else {
      const file = req.files.inputFile;
      const fileSize = file.data.length;
      const ext = path.extname(file.name);
      fileName = file.md5 + ext;

      const allowedType = [".png", ".jpg", ".jpeg"];

      if (!allowedType.includes(ext.toLowerCase())) {
        return res.status(422).json({ msg: "Invalid image" });
      }

      if (fileSize > 2000000) {
        return res.status(422).json({ msg: "Images must be less than 2MB" });
      }

      const filepath = `../public/images/${profile.image}`;

      if (fs.existsSync(filepath)) {
        try {
          fs.unlinkSync(filepath);
          console.log(`File ${filepath} successfully deleted`);
        } catch (err) {
          console.error(`Failed to delete file ${filepath}: ${err}`);
        }
      } else {
        console.warn(`File ${filepath} not found`);
      }

      file.mv(`../public/images/${fileName}`, (err) => {
        if (err) {
          console.error(`Error moving file: ${err}`);
          return res.status(500).json({ msg: "Error moving file" });
        }
      });

      console.log("file:", file); // Cek apakah file terdeteksi
      console.log("fileName:", fileName); // Cek apakah fileName sesuai

      file.mv(`../public/images/${fileName}`, (err) => {
        if (err) return res.status(500).json({ msg: err.message });
      });
    }

    const {
      firstName,
      lastName,
      phone,
      organize,
      address,
      city,
      state,
      country,
    } = req.body;

    await Profile.update(
      {
        firstName,
        lastName,
        phone,
        organize,
        address,
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

    res.status(201).json({
      message: `Profile ${profile.firstName} ${profile.lastName} has been updated for admin`,
    });
  } catch (error) {
    res.status(501).json({ msg: error.message });
    console.log(error.message);
  }
};
