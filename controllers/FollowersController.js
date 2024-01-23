import Followers from "../models/FollowersModel.js";
import User from "../models/UsersModel.js";
import Event from "../models/EventModel.js";

export const followUser = async (req, res) => {
  try {
    const { followerId, followingId } = req.body;

    // Pastikan follower dan following merupakan user yang valid
    const follower = await User.findByPk(followerId);
    const following = await User.findByPk(followingId);

    if (!follower || !following) {
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
    const { followerId, followingId } = req.body;

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
  
      // Ekstrak ID pengguna yang diikuti menjadi array
      const followedUserIds = followedUsers.map((followedUser) => followedUser.userId);
  
      // Dapatkan semua acara yang dibuat oleh pengguna yang diikuti
      const events = await Event.findAll({
        where: {
          userId: followedUserIds,
        },
        include: [
          // tambahkan model-model terkait di sini jika diperlukan
        ],
      });
  
      res.status(200).json(events);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Internal Server Error" });
    }
  };