import Followers from "../models/FollowersModel.js";
import User from "../models/UsersModel.js";
import Event from "../models/EventModel.js";
import Event_img from "../models/EventImageModel.js";
import Event_tags from "../models/EventTagsModel.js";
import Event_loc from "../models/EventLocationModel.js";

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
          model: Event_img,
        },
        {
          model: Event_tags,
        },
        {
          model: Event_loc,
        },
      ],
    });

    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
