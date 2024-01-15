import User from "../models/UsersModel.js";
import bcryptjs from "bcryptjs";

export const getUsers = async (req, res) => {
  try {
    const response = await User.findAll({
      attributes: ["id", "uuid", "name", "email", "role"],
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const getUsersById = async (req, res) => {
  try {
    const response = await User.findOne({
      attributes: ["uuid", "name", "email", "role"],
      where: {
        uuid: req.params.uuid,
      },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
export const createAdminUsers = async (req, res) => {
  const { usename, email, password } = req.body;
  const salt = await bcryptjs.genSalt();
  const hashPassword = await bcryptjs.hash(password, salt);
  try {
    await User.create({
      usename: usename,
      email: email,
      password: hashPassword,
      role: 'admin',
    });
    res.status(201).json({ msg: "register berhasil" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};


export const updateUsers = async (req, res) => {
  try {
    const user = await User.findOne({
      attributes: ["id", "uuid", "username", "email", "role"],
      where: {
        uuid: req.params.uuid,
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    const { name, email, password, confPassword, role } = req.body;
    let updateFields = {};

    if (name) {
      updateFields.name = name;
    }

    if (email) {
      updateFields.email = email;
    }

    if (password && password !== confPassword) {
      return res.status(400).json({ msg: "Password dan ConfirmPassword tidak cocok" });
    }

    if (password) {
      const salt = await bcryptjs.genSalt();
      updateFields.password = await bcryptjs.hash(password, salt);
    }

    if (role) {
      updateFields.role = role;
    }

    await User.update(updateFields, {
      where: {
        id: user.id,
      },
    });

    res.status(200).json({ msg: "User berhasil diperbarui" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const deleteUsers = async (req, res) => {
  const user = await User.findOne({
    where: {
      uuid: req.params.uuid,
    },
  });
  if (!user) return res.status(404).json({ msg: "user tidak ditemukan" });
  try {
    await User.destroy({
      where: {
        id: user.id,
      },
    });
    res.status(200).json({ msg: "Users deleted" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};