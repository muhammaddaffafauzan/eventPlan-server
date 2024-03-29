import Profile from "../models/ProfileModel.js";
import User from "../models/UsersModel.js";
import Event from "../models/EventModel.js";
import bcryptjs from "bcryptjs";

export const getUsers = async (req, res) => {
  try {
    const response = await User.findAll({
      attributes: ["id", "uuid", "username", "email", "role"],
      where:{
        role: "user"
      }
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getAdmin = async (req, res) => {
  try {
    const response = await User.findAll({
      attributes: ["id", "uuid", "username", "email", "role"],
      where:{
        role: "admin"
      }
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const getUsersById = async (req, res) => {
  try {
    const response = await User.findOne({
      attributes: ["uuid", "username", "email", "role"],
      where: {
        uuid: req.params.uuid,
        role: "user"
      },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const getAdminById = async (req, res) => {
  try {
    const response = await User.findOne({
      attributes: ["uuid", "username", "email", "role"],
      where: {
        uuid: req.params.uuid,
        role: "admin"
      },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const createAdminUsers = async (req, res) => {
  const { username, email, password, confPassword } = req.body;
  const salt = await bcryptjs.genSalt();
  const hashPassword = await bcryptjs.hash(password, salt);

  if (password !== confPassword) {
    return res.status(400).json({ msg: 'Password and confirmation password do not match' });
  }

  try {
    await User.create({
      username: username,
      email: email,
      password: hashPassword,
      role: "admin",
    });
    res.status(201).json({ msg: "create admin account successfully" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const createUsers = async (req, res) => {
  const { username, email, password, confPassword } = req.body;
  const salt = await bcryptjs.genSalt();
  const hashPassword = await bcryptjs.hash(password, salt);

  if (password !== confPassword) {
    return res.status(400).json({ msg: 'Password and confirmation password do not match' });
  }

  try {
    await User.create({
      username: username,
      email: email,
      password: hashPassword,
      role: "user",
    });
    res.status(201).json({ msg: "create user account successfully" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const updateUsersById = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { uuid: req.params.uuid },
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const { name, email, password, confPassword, role } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    if (password) {
      if (password !== confPassword) {
        return res.status(400).json({ msg: 'Password and Confirmation Password do not match' });
      }

      const salt = await bcryptjs.genSalt();
      updateFields.password = await bcryptjs.hash(password, salt);
    }

    if (role) updateFields.role = role;

    await User.update(updateFields, { where: { id: user.id } });

    res.status(200).json({ msg: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ msg: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.userId, role: 'user' },
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found or not authorized' });
    }

    const { name, email, password, confPassword } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    if (password) {
      if (password !== confPassword) {
        return res.status(400).json({ msg: 'Password and Confirmation Password do not match' });
      }

      const salt = await bcryptjs.genSalt();
      updateFields.password = await bcryptjs.hash(password, salt);
    }

    await User.update(updateFields, { where: { id: user.id } });

    res.status(200).json({ msg: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ msg: error.message });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.userId, role: 'admin' },
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found or not authorized' });
    }

    const { name, email, password, confPassword } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    if (password) {
      if (password !== confPassword) {
        return res.status(400).json({ msg: 'Password and Confirmation Password do not match' });
      }

      const salt = await bcryptjs.genSalt();
      updateFields.password = await bcryptjs.hash(password, salt);
    }

    await User.update(updateFields, { where: { id: user.id } });

    res.status(200).json({ msg: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(400).json({ msg: error.message });
  }
};

export const deleteUsers = async (req, res) => {
  const user = await User.findOne({
    where: {
      uuid: req.params.uuid,
    },
  });
  if (!user) return res.status(404).json({ msg: "User not found" });
  let profile;
  let event;
  if (user.role === "user") {
    profile = await Profile.findOne({
      where:{
        userId: user.id
      }
    });
    event = await Event.findAll({
      where:{
        userId: user.id
      }
    });
    
    if (!profile && !event ) return res.status(404).json({ msg: "Profile user and event not found" });

    const imagePathProfile = path.join(__dirname, `../public/images/${profile.image}`);
    fs.unlinkSync(imagePathProfile);

    const imagePathEvent = path.join(__dirname, `../public/images/${event.image}`);
    fs.unlinkSync(imagePathEvent);
  }

  try {
    await User.destroy({
      where: {
        id: user.id,
      },
    }); 
    res.status(200).json({ msg: "User deleted" });
  } catch (error) {
    res.status(400).json({msg: error.message});
    console.log(error)
  }
};