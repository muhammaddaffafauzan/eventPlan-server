import Profile from "../models/ProfileModel.js";
import User from "../models/UsersModel.js";
import bcryptjs from "bcryptjs";

export const getAllProfileUsers = async(req, res) => {
    try {
        const response = await Profile.findAll({
         include: [{
            model: User,
            attributes: ["id","username", "email"]
         }]
        })
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
        console.log(error)
    }
};

export const getProfileUsersByUuid = async(req, res) => {
    const profile = await Profile.findOne({
        where:{
            uuid: req.params.uuid
        }
    })
    try {
        const response = await Profile.findOne({
         where:{
            id: profile.id
         },
         include: [{
            model: User,
            attributes: ["id","username", "email"]
         }]
        })
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
        console.log(error)
    }
};

export const createProfileAndUser = async(req, res) =>{
    try {
        const { username, email, password, confPassword, firstName, lastName, phone, organize, address, city, state, country } = req.body;
        if (password !== confPassword) {
          return res.status(400).json({ message: "Password dan Confirm Password tidak cocok" });
        }
    

        const newUser = await User.create({
          username,
          email,
          password: await bcryptjs.hash(password, await bcryptjs.genSalt()),
          role: "user"
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
        });
    
        res.status(201).json({ message: "Registrasi berhasil", user: newUser, profile: newProfile });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan server" });
      }
};