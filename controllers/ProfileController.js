import Profile from "../models/ProfileModel.js";
import User from "../models/UsersModel.js";
import bcryptjs from "bcryptjs";

export const getAllProfileUsers = async (req, res) => {
  try {
    const response = await Profile.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
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
  const profile = await Profile.findOne({
    where: {
      uuid: req.params.uuid,
    },
  });
  try {
    const response = await Profile.findOne({
      where: {
        id: profile.id,
      },
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
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
        .json({ message: "Password dan Confirm Password tidak cocok" });
    }

    if (req.files === null)
      return res.status(400).json({ msg: "No File Uploaded" });
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    const fileName = file.md5 + ext;
    const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
    const allowedType = [".png", ".jpg", "jpeg"];

    if (!allowedType.includes(ext.toLocaleLowerCase()))
      return res.status(422).json({ msg: "Invalid Image" });
    if (fileSize > 5000000)
      return res.status(422).json({ msg: "Image must be less than 5MB" });

    file.mv(`./public/images/${fileName}`, async (err) => {
      if (err) return res.status(500).json({ msg: err.message });
    });

    const newUser = await User.create({
      username,
      email,
      password: await bcryptjs.hash(password, await bcryptjs.genSalt()),
      role: "user",
    });

    // Buat profil baru terkait dengan pengguna
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
      user: newUser,
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
      uuid: req.params.uuid,
    },
  });
  if (!profile) return res.status(404).json({ msg: "Data not found" });

  let fileName = "";

  if (req.files === null) {
    fileName = profile.image;
  } else {
    const file = req.files.file;
    const fileSize = file.data.length;
    const ext = path.extname(file.name);
    fileName = file.md5 + ext;

    const allowedType = [".png", ".jpg", ".jpeg"];

    if (!allowedType.includes(ext.toLowerCase()))
      return res.status(422).json({ msg: "Invalid image" });
    if (fileSize > 5000000)
      return res.status(422).json({ msg: "Images must be less than 5MB" });

    const filepath = `./public/images/${profile.image}`;

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

    file.mv(`./public/images/${fileName}`, (err) => {
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
  } catch (error) {
    res.status(501).json({ msg: error.message });
    console.log(error.message);
  }
};
