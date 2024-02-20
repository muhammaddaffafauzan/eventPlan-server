import Profile from "../models/ProfileModel.js";
import User from "../models/UsersModel.js";
import fs from "fs";
import path from "path";
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

export const createProfileForUser = async (req, res) => {
  try {
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
      message: "Profile successfully created for User",
      profile: newProfile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

export const updateProfileUser = async (req, res) => {
  try {
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

      const uploadPath = path.join(__dirname, '../public/images', fileName);

      // Ensure the directory exists
      if (!fs.existsSync(path.join(__dirname, '../public/images'))) {
        fs.mkdirSync(path.join(__dirname, '../public/images'));
      }

      file.mv(uploadPath, (err) => {
        if (err) {
          console.error(`Error moving file: ${err}`);
          return res.status(500).json({ msg: "Error moving file" });
        }
        console.log(`File ${uploadPath} successfully moved`);
      });

      console.log("file:", file); // Check if the file is detected
      console.log("fileName:", fileName); // Check if fileName is correct
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
      message: `Profile ${profile.firstName} ${profile.lastName} has been updated`,
    });
  } catch (error) {
    res.status(501).json({ msg: error.message });
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
    


    const fileName = profile.image;
    const imagePath = path.join(__dirname, "../public/images/", fileName);

    if (!fs.existsSync(imagePath)) {
      console.warn(`File ${fileName} not found at ${imagePath}`);
      return res.status(404).json({ msg: "Profile image not found" });
    }

    if (profile.image !== undefined && profile.url !== undefined) {
      res.status(400).json({msg: 'Image and image url are missing'})
    }

        await Profile.update(
      {
        image: '',
        url: '',
      },
      {
        where: {
          id: profile.id,
        },
      }
    );

    fs.unlinkSync(imagePath);
    console.log(`File ${fileName} successfully deleted`);

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
      organize: "Official profileplan",
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

