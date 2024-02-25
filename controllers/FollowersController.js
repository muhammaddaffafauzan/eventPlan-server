import Followers from "../models/FollowersModel.js";
import User from "../models/UsersModel.js";
import Event from "../models/EventModel.js";
import Event_loc from "../models/EventLocationModel.js";
import Profile from "../models/ProfileModel.js";
import Event_category from "../models/EventCategoryModel.js";

export const followUser = async (req, res) => {
  try {
    const { followingId } = req.body;
    const followerId = req.userId; // Menggunakan req.userId sebagai ID pengguna pengikut

    // Pastikan following merupakan user yang valid
    const following = await User.findByPk(followingId);

    if (!following) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Cek apakah sudah diikuti sebelumnya
    const existingFollow = await Followers.findOne({
      where: {
        followerId,
        followingId,
      },
    });

    if (existingFollow) {
      return res.status(400).json({ msg: "User already followed" });
    }

    // Tambahkan ke daftar following
    await Followers.create({
      userId: followerId,
      followerId,
      followingId,
      date_followed: new Date(),
    });

    res.status(201).json({ msg: "User followed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

export const unfollowUser = async (req, res) => {
  try {
    const { followingId } = req.body;
    const followerId = req.userId; // Menggunakan req.userId sebagai ID pengguna pengikut

    // Pastikan follower dan following merupakan user yang valid
    const follower = await User.findByPk(followerId);
    const following = await User.findByPk(followingId);

    if (!follower || !following) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Hapus dari daftar following
    await Followers.destroy({
      where: {
        followerId,
        followingId,
      },
    });

    res.status(200).json({ msg: "User unfollowed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

export const getEventsByFollowedUsers = async (req, res) => {
  try {
    // Dapatkan ID pengguna yang sedang login
    const userId = req.userId;

    // Temukan semua pengguna yang diikuti oleh pengguna yang sedang login
    const followedUsers = await Followers.findAll({
      where: {
        followerId: userId,
      },
    });

    // Pastikan ada pengguna yang diikuti
    if (followedUsers.length === 0) {
      return res.status(200).json([]); // Return empty array jika tidak ada pengguna yang diikuti
    }

    // Ekstrak ID pengguna yang diikuti menjadi array
    const followedUserIds = followedUsers.map(
      (followedUser) => followedUser.followingId
    );

    const events = await Event.findAll({
      where: {
        userId: followedUserIds,
      },
      include: [
        {
          model: Event_loc,
        },
        {
          model: Event_category, // Include the Event_category model
          attributes: ['category'], // Include only the category attribute
        },
      ],
    });

    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

export const getFollowersCountAndFollowingCount = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      where:{
        uuid: req.params.uuid
      }
    });

    const userId = profile.userId;

    // Hitung jumlah pengikut user
    const followersCount = await Followers.count({
      where: {
        followingId: userId,
      },
    });

    // Hitung jumlah yang diikuti oleh user
    const followingCount = await Followers.count({
      where: {
        followerId: userId,
      },
    });

    // Gabungkan data dari dua respons ke dalam satu objek
    const result = {
      followersCount,
      followingCount,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
