import Event from "../models/EventModel.js";
import Event_loc from "../models/EventLocationModel.js";
import Event_check from "../models/EventChecklistModel.js";
import Event_category from "../models/EventCategoryModel.js";
import Event_fav from "../models/EventFavoriteModel.js";
import User from "../models/UsersModel.js";
import Profile from "../models/ProfileModel.js";
import Followers from "../models/FollowersModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Op } from "sequelize";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getAllEventsForAdmin = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "uuid", "username", "email", "role"],
          include: [
            {
              model: Profile,
            },
          ],
        },
        {
          model: Event_loc,
        },
        {
          model: Event_category,
        },
      ],
    });

    const eventsWithoutProfiles = events.map((event) => {
      const eventJSON = event.toJSON();
      if (
        eventJSON.user &&
        eventJSON.user.Profiles &&
        eventJSON.user.Profiles.length > 0
      ) {
        eventJSON.user.Profiles = eventJSON.user.Profiles[0];
      } else {
        eventJSON.user.Profiles = {};
      }

      // Simpan nilai typeId dan categoryId di variabel
      const eventCategory = eventJSON.Event_Category
        ? eventJSON.Event_Category.category
        : null;

      // Buat objek baru dengan posisi typeId dan categoryId di atas
      const modifiedEvent = {
        id: eventJSON.id,
        userId: eventJSON.userId,
        uuid: eventJSON.uuid,
        title: eventJSON.title,
        organizer: eventJSON.organizer,
        category: eventCategory,
        price: eventJSON.price,
        start_date: eventJSON.start_date,
        end_date: eventJSON.end_date,
        start_time: eventJSON.start_time,
        end_time: eventJSON.end_time,
        type_location: eventJSON.type_location,
        technical: eventJSON.technical,
        description: eventJSON.description,
        language: eventJSON.language,
        views: eventJSON.views,
        admin_validation: eventJSON.admin_validation,
        image: eventJSON.image,
        url: eventJSON.url,
        tags: eventJSON.tags,
        createdAt: eventJSON.createdAt,
        updatedAt: eventJSON.updatedAt,
        user: eventJSON.user,
        event_locations: eventJSON.event_locations,
      };

      return modifiedEvent;
    });

    res.status(201).json(eventsWithoutProfiles);
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

export const getEventByIdForAdmin = async (req, res) => {
  try {
    const event = await Event.findOne({
      where: {
        uuid: req.params.uuid,
      },
      include: [
        {
          model: User,
          attributes: ["id", "uuid", "username", "email", "role"],
          include: [
            {
              model: Profile,
            },
          ],
        },
        {
          model: Event_loc,
        },
        {
          model: Event_category,
        },
      ],
    });

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Update views
    await Event.update(
      { views: event.views + 1 },
      {
        where: {
          uuid: req.params.uuid,
        },
      }
    );

    const eventJSON = event.toJSON();
    if (
      eventJSON.user &&
      eventJSON.user.Profiles &&
      eventJSON.user.Profiles.length > 0
    ) {
      eventJSON.user.Profiles = eventJSON.user.Profiles[0];
    } else {
      eventJSON.user.Profiles = {};
    }

    // Simpan nilai typeId dan categoryId di variabel
    const eventCategory = eventJSON.Event_Category
      ? eventJSON.Event_Category.category
      : null;

    // Buat objek baru dengan posisi typeId dan categoryId di atas
    const modifiedEvent = {
      id: eventJSON.id,
      userId: eventJSON.userId,
      uuid: eventJSON.uuid,
      title: eventJSON.title,
      organizer: eventJSON.organizer,
      category: eventCategory,
      price: eventJSON.price,
      start_date: eventJSON.start_date,
      end_date: eventJSON.end_date,
      start_time: eventJSON.start_time,
      end_time: eventJSON.end_time,
      type_location: eventJSON.type_location,
      technical: eventJSON.technical,
      description: eventJSON.description,
      language: eventJSON.language,
      views: eventJSON.views,
      admin_validation: eventJSON.admin_validation,
      image: eventJSON.image,
      url: eventJSON.url,
      tags: eventJSON.tags,
      createdAt: eventJSON.createdAt,
      updatedAt: eventJSON.updatedAt,
      user: eventJSON.user,
      event_locations: eventJSON.event_locations,
    };

    res.status(200).json(modifiedEvent);
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

export const getAllEventsForNonAdmin = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        {
          model: User,
          attributes: ["id", "uuid", "username", "email", "role"],
          include: [
            {
              model: Profile,
            },
          ],
        },
        {
          model: Event_loc,
        },
        {
          model: Event_category,
        },
      ],
      where: {
        admin_validation: "Approved",
      },
    });

    const eventsWithoutProfiles = await Promise.all(
      events.map(async (event) => {
        const eventJSON = event.toJSON();
        if (
          eventJSON.user &&
          eventJSON.user.Profiles &&
          eventJSON.user.Profiles.length > 0
        ) {
          eventJSON.user.Profiles = eventJSON.user.Profiles[0];
        } else {
          eventJSON.user.Profiles = {};
        }

        // Hitung jumlah pengikut (followers count)
        const followersCount = await Followers.count({
          where: { followingId: eventJSON.userId },
        });

        // Hitung jumlah event yang dibuat oleh pengguna (event count)
        const eventCount = await Event.count({
          where: { userId: eventJSON.userId },
        });

        // Simpan nilai typeId dan categoryId di variabel
        const eventCategory = eventJSON.Event_Category
          ? eventJSON.Event_Category.category
          : null;

        // Buat objek baru dengan posisi typeId dan categoryId di atas
        const modifiedEvent = {
          id: eventJSON.id,
          userId: eventJSON.userId,
          uuid: eventJSON.uuid,
          title: eventJSON.title,
          organizer: eventJSON.organizer,
          category: eventCategory,
          price: eventJSON.price,
          start_date: eventJSON.start_date,
          end_date: eventJSON.end_date,
          start_time: eventJSON.start_time,
          end_time: eventJSON.end_time,
          type_location: eventJSON.type_location,
          technical: eventJSON.technical,
          description: eventJSON.description,
          language: eventJSON.language,
          views: eventJSON.views,
          admin_validation: eventJSON.admin_validation,
          image: eventJSON.image,
          url: eventJSON.url,
          tags: eventJSON.tags,
          createdAt: eventJSON.createdAt,
          updatedAt: eventJSON.updatedAt,
          user: eventJSON.user,
          event_locations: eventJSON.event_locations,
          followersCount: followersCount,
          eventCount: eventCount,
        };

        return modifiedEvent;
      })
    );

    res.status(201).json(eventsWithoutProfiles);
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

export const getEventByIdForNonAdmin = async (req, res) => {
  try {
    const event = await Event.findOne({
      where: {
        uuid: req.params.uuid,
        admin_validation: "Approved",
      },
      include: [
        {
          model: User,
          attributes: ["id", "uuid", "username", "email", "role"],
          include: [
            {
              model: Profile,
            },
          ],
        },
        {
          model: Event_loc,
        },
        {
          model: Event_category,
        },
      ],
    });

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Update views
    await Event.update(
      { views: event.views + 1 },
      {
        where: {
          uuid: req.params.uuid,
        },
      }
    );

    const eventJSON = event.toJSON();
    if (
      eventJSON.user &&
      eventJSON.user.Profiles &&
      eventJSON.user.Profiles.length > 0
    ) {
      eventJSON.user.Profiles = eventJSON.user.Profiles[0];
    } else {
      eventJSON.user.Profiles = {};
    }

    // Hitung jumlah pengikut (followers count)
    const followersCount = await Followers.count({
      where: { followingId: eventJSON.userId },
    });

    // Hitung jumlah event yang dibuat oleh pengguna (event count)
    const eventCount = await Event.count({
      where: { userId: eventJSON.userId },
    });

    // Simpan nilai typeId dan categoryId di variabel
    const eventCategory = eventJSON.Event_Category
      ? eventJSON.Event_Category.category
      : null;

    // Buat objek baru dengan posisi typeId dan categoryId di atas
    const modifiedEvent = {
      id: eventJSON.id,
      userId: eventJSON.userId,
      uuid: eventJSON.uuid,
      title: eventJSON.title,
      organizer: eventJSON.organizer,
      category: eventCategory,
      price: eventJSON.price,
      start_date: eventJSON.start_date,
      end_date: eventJSON.end_date,
      start_time: eventJSON.start_time,
      end_time: eventJSON.end_time,
      type_location: eventJSON.type_location,
      technical: eventJSON.technical,
      description: eventJSON.description,
      language: eventJSON.language,
      views: eventJSON.views,
      admin_validation: eventJSON.admin_validation,
      image: eventJSON.image,
      url: eventJSON.url,
      tags: eventJSON.tags,
      createdAt: eventJSON.createdAt,
      updatedAt: eventJSON.updatedAt,
      user: eventJSON.user,
      event_locations: eventJSON.event_locations,
      followersCount: followersCount,
      eventCount: eventCount,
    };

    res.status(201).json(modifiedEvent);
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

export const getEventForUser = async (req, res) => {
  const user = await User.findOne({
    where: {
      id: req.userId,
    },
  });
  try {
    const events = await Event.findAll({
      where: {
        userId: user.id,
      },
      include: [
        {
          model: Event_check, // Include Event_check model
        },
        {
          model: Event_loc, // Include Event_loc model
        },
        {
          model: Event_category,
        },
      ],
    });
    const eventsWithoutProfiles = events.map((event) => {
      const eventJSON = event.toJSON();

      // Simpan nilai typeId dan categoryId di variabel
      const eventCategory = eventJSON.Event_Category
        ? eventJSON.Event_Category.category
        : null;

      // Buat objek baru tanpa properti event_checks dan event_locations
      const modifiedEvent = {
        id: eventJSON.id,
        userId: eventJSON.userId,
        uuid: eventJSON.uuid,
        title: eventJSON.title,
        organizer: eventJSON.organizer,
        category: eventCategory,
        price: eventJSON.price,
        start_date: eventJSON.start_date,
        end_date: eventJSON.end_date,
        start_time: eventJSON.start_time,
        end_time: eventJSON.end_time,
        type_location: eventJSON.type_location,
        technical: eventJSON.technical,
        description: eventJSON.description,
        language: eventJSON.language,
        views: eventJSON.views,
        admin_validation: eventJSON.admin_validation,
        image: eventJSON.image,
        url: eventJSON.url,
        tags: eventJSON.tags,
        createdAt: eventJSON.createdAt,
        updatedAt: eventJSON.updatedAt,
        event_locations: eventJSON.event_locations, // Include event_locations
        event_checks: eventJSON.event_checks, // Include event_checks
      };

      return modifiedEvent;
    });

    res.status(201).json(eventsWithoutProfiles);
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

export const getEventByUuidForUser = async (req, res) => {
  const { uuid } = req.params; // Ambil UUID dari parameter permintaan

  try {
    // Cari acara berdasarkan UUID
    const event = await Event.findOne({
      where: {
        uuid: uuid,
      },
      include: [
        {
          model: Event_check,
        },
        {
          model: Event_loc,
        },
        {
          model: Event_category,
        },
      ],
    });

    // Jika acara tidak ditemukan
    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Konversi acara menjadi bentuk JSON
    const eventJSON = event.toJSON();

    // Simpan nilai typeId dan categoryId di variabel
    const eventCategory = eventJSON.Event_Category
      ? eventJSON.Event_Category.category
      : null;

    // Buat objek baru tanpa properti event_locations dan event_checks
    const modifiedEvent = {
      id: eventJSON.id,
      userId: eventJSON.userId,
      uuid: eventJSON.uuid,
      title: eventJSON.title,
      organizer: eventJSON.organizer,
      category: eventCategory,
      price: eventJSON.price,
      start_date: eventJSON.start_date,
      end_date: eventJSON.end_date,
      start_time: eventJSON.start_time,
      end_time: eventJSON.end_time,
      type_location: eventJSON.type_location,
      technical: eventJSON.technical,
      description: eventJSON.description,
      language: eventJSON.language,
      views: eventJSON.views,
      admin_validation: eventJSON.admin_validation,
      image: eventJSON.image,
      url: eventJSON.url,
      tags: eventJSON.tags,
      createdAt: eventJSON.createdAt,
      updatedAt: eventJSON.updatedAt,
      event_locations: eventJSON.event_locations,
      event_checklists: eventJSON.event_checklists, // Pastikan properti ini ada
    };

    // Kirim respons dengan detail acara
    res.status(200).json(modifiedEvent);
  } catch (error) {
    // Tangani kesalahan
    console.log(error);
    res.status(500).json({ msg: "Internal server error" });
  }
};

export const createEvent = async (req, res) => {
  const {
    title,
    organizer,
    categoryId,
    price,
    start_date,
    end_date,
    start_time,
    end_time,
    type_location,
    technical,
    description,
    language,
    tags,
    city,
    state,
    country,
    address,
    lat,
    long,
  } = req.body;

  const userRole = req.role;

  // Check if req.files is undefined or req.files.inputFile is undefined
  if (!req.files || !req.files.inputFile) {
    return res.status(400).json({ msg: "No File Uploaded" });
  }

  const file = req.files.inputFile;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
  const allowedType = [".png", ".jpg", ".jpeg"];

  if (!allowedType.includes(ext.toLocaleLowerCase())) {
    return res.status(422).json({ msg: "Invalid Image" });
  }

  if (fileSize > 2000000) {
    return res.status(422).json({ msg: "Image must be less than 2MB" });
  }

  const imagePath = path.join(__dirname, "../public/images/", fileName);

  file.mv(imagePath, async (err) => {
    if (err) return res.status(500).json({ msg: err.message });

    const tagsArray = tags.split(",").map((tag) => tag.trim());

    // get organize
    const profile = await Profile.findOne({
      where: {
        userId: req.userId,
      },
    });

    try {
      // Create event without including tags initially
      const newEvent = await Event.create({
        userId: req.userId,
        title: title,
        organizer:
          userRole === "admin" ? "Official Eventplan" : profile.organize,
        categoryId: categoryId,
        price: price,
        start_date: start_date,
        end_date: end_date,
        start_time: start_time,
        end_time: end_time,
        type_location: type_location,
        technical: technical,
        description: description,
        language: language,
        admin_validation: userRole === "admin" ? "Approved" : "Reviewed",
        image: fileName,
        url: url,
        tags: tagsArray,
      });

      // Wrap req.body with a variable
      const locationPayload = {
        city,
        state,
        country,
        address,
        lat,
        long,
      };

      // Call the addLocationForEvent function
      await addLocationForEventInternal(newEvent.uuid, locationPayload);

      res
        .status(201)
        .json({ msg: `Event ${newEvent.title} created successfully` });
    } catch (error) {
      res.status(501).json({ msg: error.message });
      console.log(error);
    }
  });
};

const addLocationForEventInternal = async (eventUuid, locationPayload) => {
  try {
    // Find the event based on uuid
    const event = await Event.findOne({
      where: {
        uuid: eventUuid,
      },
    });

    if (!event) {
      console.error("Event not found");
      return;
    }

    // Find or create location for the event
    const [location, created] = await Event_loc.findOrCreate({
      where: { eventId: event.id },
      defaults: locationPayload,
    });

    if (!created) {
      // If location already exists, update it
      await location.update(locationPayload);

      console.log("Location updated for event");
    } else {
      console.log("Location added for event");
    }
  } catch (error) {
    console.error(error);
  }
};

export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    let fileName = event.image;

    if (req.files && req.files.inputFile) {
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

      const uploadPath = path.join(__dirname, "../public/images", fileName);

      // Ensure the directory exists
      if (!fs.existsSync(path.join(__dirname, "../public/images"))) {
        fs.mkdirSync(path.join(__dirname, "../public/images"));
      }

      // Delete the existing file
      const filepath = path.join(__dirname, "../public/images", event.image);
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

      // Move the new file
      await file.mv(uploadPath);
    }

    const {
      title,
      categoryId,
      price,
      start_date,
      end_date,
      start_time,
      end_time,
      type_location,
      technical,
      description,
      language,
      tags,
      city,
      state,
      country,
      address,
      lat,
      long,
    } = req.body;
    const tagsArray = tags.split(",").map((tag) => tag.trim());

    const userRole = req.role;

    // Get user profile
    const profile = await Profile.findOne({
      where: {
        userId: req.userId,
      },
    });

    await Event.update(
      {
        userId: req.userId,
        title: title,
        organizer:
          userRole === "admin" ? "Official Eventplan" : profile.organize,
        categoryId: categoryId,
        price: price,
        start_date: start_date,
        end_date: end_date,
        start_time: start_time,
        end_time: end_time,
        type_location: type_location,
        technical: technical,
        description: description,
        language: language,
        image: fileName,
        url: `${req.protocol}://${req.get("host")}/images/${fileName}`,
        tags: tagsArray,
      },
      {
        where: {
          id: event.id,
        },
      }
    );

    // Wrap req.body with a variable
    const locationPayload = {
      city,
      state,
      country,
      address,
      lat,
      long,
    };

    // Call the addLocationForEvent function
    await addLocationForEventInternal(event.uuid, locationPayload);

    res.status(201).json({ msg: `Event has been updated` });
  } catch (error) {
    res.status(501).json({ msg: error.message });
    console.error(error);
  }
};

export const addLocationForEvent = async (req, res) => {
  const { city, state, country, address, lat, long } = req.body;
  try {
    // Temukan event berdasarkan uuid
    const event = await Event.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Temukan atau buat lokasi untuk event
    const [location, created] = await Event_loc.findOrCreate({
      where: { eventId: event.id },
      defaults: {
        city,
        state,
        country,
        address,
        lat,
        long,
      },
    });

    if (!created) {
      // If location already exists, update it
      await location.update({
        city,
        state,
        country,
        address,
        lat,
        long,
      });

      return res.status(200).json({
        message: "Location updated for event",
        location,
      });
    } else {
      return res.status(201).json({
        message: "Location added for event",
        location,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: error.message });
  }
};

export const addChecklistForEvent = async (req, res) => {
  const event = await Event.findOne({
    where: {
      uuid: req.params.uuid,
    },
  });

  if (!event) {
    res.status(404).json({ msg: "Event not found" });
  }

  try {
    const { item } = req.body;

    const newChecklist = await Event_check.create({
      eventId: event.id,
      item,
      status: false,
      date_added: new Date(),
      date_updated: new Date(),
    });

    res.status(201).json({
      message: "Checklist added successfully",
      checklist: newChecklist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

export const updateChecklistForEvent = async (req, res) => {
  const event = await Event.findOne({
    where: {
      uuid: req.params.uuid,
    },
  });

  if (!event) {
    res.status(404).json({ msg: "Event not found" });
  }

  try {
    const { item, status } = req.body;

    const existingChecklist = await Event_check.findOne({
      where: {
        id: req.params.id_check,
        eventId: event.id,
      },
    });

    if (!existingChecklist) {
      return res.status(404).json({ msg: "Checklist not found" });
    }

    // Update checklist
    existingChecklist.item = item || existingChecklist.item;
    existingChecklist.status =
      status !== undefined ? status : existingChecklist.status;
    existingChecklist.date_updated = new Date();

    await existingChecklist.save();

    res.status(200).json({
      message: "Checklist updated successfully",
      checklist: existingChecklist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

export const deleteChecklistForEvent = async (req, res) => {
  try {
    const { id_check } = req.params;

    const existingChecklist = await Event_check.findOne({
      where: {
        id: id_check,
      },
    });

    if (!existingChecklist) {
      return res.status(404).json({ msg: "Checklist not found" });
    }

    // Hapus checklist
    await existingChecklist.destroy();

    res.status(200).json({
      message: "Checklist deleted successfully",
      checklist: existingChecklist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Cek apakah file gambar dimiliki oleh rekaman data event lain
    const otherEvents = await Event.findAll({
      where: {
        image: event.image,
        id: {
          [Op.ne]: event.id,
        },
      },
    });

    if (otherEvents.length > 0) {
      // File gambar digunakan oleh rekaman data lain, jadi hanya hapus event dari database
      await Event.destroy({
        where: {
          id: event.id,
        },
      });

      return res.status(200).json({
        msg: `Event ${event.title} deleted from database, but image is still in use by other events`,
      });
    }

    // Bangun jalur file gambar
    const imagePath = path.join(__dirname, `../public/images/${event.image}`);

    // Hapus file gambar dari direktori jika ada
    if (fs.existsSync(imagePath) && event.image) {
      fs.unlinkSync(imagePath); // Hapus file gambar
    }

    // Hapus event dari database
    await Event.destroy({
      where: {
        id: event.id,
      },
    });

    return res
      .status(200)
      .json({ msg: `Event ${event.title} successfully deleted` });
  } catch (error) {
    return res.status(500).json({ msg: error.message });
  }
};

export const updateEventValidation = async (req, res) => {
  const { admin_validation } = req.body;
  try {
    // Pastikan pengguna yang memanggil fungsi memiliki role "admin"
    if (req.role !== "admin") {
      return res.status(403).json({
        msg: "Access forbidden. Only admin can update validation status.",
      });
    }

    // Temukan event berdasarkan uuid
    const event = await Event.findOne({
      where: {
        uuid: req.params.uuid,
      },
    });

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }

    // Update status admin_validation pada event
    await event.update({
      admin_validation: admin_validation,
    });

    res.status(200).json({
      message: "Event validation status updated",
      event: event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

export const getFavoriteEvents = async (req, res) => {
  const userId = req.userId;

  try {
    // Cari semua event yang disukai oleh pengguna
    const favoriteEvents = await Event_fav.findAll({
      where: {
        userId,
      },
      include: [
        {
          model: Event,
          include: [Event_loc], // Menyertakan tabel Event_loc
        },
      ],
    });

    if (!favoriteEvents || favoriteEvents.length === 0) {
      return res.status(404).json({
        msg: "No favorite events found for the user",
      });
    }

    res.status(200).json(favoriteEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.msg });
  }
};

export const eventFavorite = async (req, res) => {
  const { eventId } = req.body;
  const userId = req.userId;

  try {
    // Periksa apakah event sudah ada di favorit pengguna
    const existingFavorite = await Event_fav.findOne({
      where: {
        eventId,
        userId,
      },
    });

    if (existingFavorite) {
      return res.status(400).json({ msg: "Event already in favorites" });
    }

    // Tambahkan event ke favorit
    const newFavorite = await Event_fav.create({
      eventId,
      userId,
    });

    res.status(201).json({
      message: "Event added to favorites",
      favorite: newFavorite,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

export const removeEventFromFavorites = async (req, res) => {
  const { eventId } = req.body;
  const userId = req.userId;

  try {
    // Periksa apakah event ada di favorit pengguna
    const favoriteToDelete = await Event_fav.findOne({
      where: {
        eventId,
        userId,
      },
    });

    if (!favoriteToDelete) {
      return res.status(400).json({ msg: "Event not found in favorites" });
    }

    // Hapus event dari favorit
    await favoriteToDelete.destroy();

    return res.status(200).json({
      message: "Event removed from favorites",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: error.message });
  }
};
