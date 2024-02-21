import Event from "../models/EventModel.js";
import Event_loc from "../models/EventLocationModel.js";
import Event_check from "../models/EventChecklistModel.js";
import User from "../models/UsersModel.js";
import Profile from "../models/ProfileModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const getAllEventsForAdmin = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'uuid', 'username', 'email', 'role'],
          include: [
            {
              model: Profile,
            },
          ],
        },
        {
          model: Event_loc,
        },
      ],
    });

    const eventsWithoutProfiles = events.map((event) => {
      const eventJSON = event.toJSON();
      if (eventJSON.user && eventJSON.user.Profiles && eventJSON.user.Profiles.length > 0) {
        // Jika Profiles ada, ambil yang pertama (asumsi satu user memiliki satu profile)
        eventJSON.user.Profiles = eventJSON.user.Profiles[0];
      } else {
        // Jika tidak ada Profiles, set menjadi objek kosong
        eventJSON.user.Profiles = {};
      }
      return eventJSON;
    });

    res.status(201).json(eventsWithoutProfiles);
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
          attributes: ['id', 'uuid', 'username', 'email', 'role'],
          include: [
            {
              model: Profile,
            },
          ],
        },
        {
          model: Event_loc,
        },
      ],
      where:{
        admin_validation: 'Approved'
      }
    });

    const eventsWithoutProfiles = events.map((event) => {
      const eventJSON = event.toJSON();
      if (eventJSON.user && eventJSON.user.Profiles && eventJSON.user.Profiles.length > 0) {
        // Jika Profiles ada, ambil yang pertama (asumsi satu user memiliki satu profile)
        eventJSON.user.Profiles = eventJSON.user.Profiles[0];
      } else {
        // Jika tidak ada Profiles, set menjadi objek kosong
        eventJSON.user.Profiles = {};
      }
      return eventJSON;
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
          attributes: ['id', 'uuid', 'username', 'email', 'role'],
          include: [
            {
              model: Profile,
            },
          ],
        },
        {
          model: Event_loc,
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
    if (eventJSON.user && eventJSON.user.Profiles && eventJSON.user.Profiles.length > 0) {
      // If Profiles exist, take the first one (assuming one user has one profile)
      eventJSON.user.Profiles = eventJSON.user.Profiles[0];
    } else {
      // If no Profiles, set it to an empty object
      eventJSON.user.Profiles = {};
    }

    res.status(200).json(eventJSON);
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
          attributes: ['id', 'uuid', 'username', 'email', 'role'],
          include: [
            {
              model: Profile,
            },
          ],
        },
        {
          model: Event_loc,
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
    if (eventJSON.user && eventJSON.user.Profiles && eventJSON.user.Profiles.length > 0) {
      // If Profiles exist, take the first one (assuming one user has one profile)
      eventJSON.user.Profiles = eventJSON.user.Profiles[0];
    } else {
      // If no Profiles, set it to an empty object
      eventJSON.user.Profiles = {};
    }

    res.status(200).json(eventJSON);
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
    let response;
    if (req.role === "user") {
      response = await Event.findAll({
        where: {
          userId: user.id,
        },
        include: [
          {
            model: Event_check,
          },
        ],
      });
      res.status(200).json(response);
    } else {
      res.status(403).json({ msg: "Access for users only" });
    }
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

export const createEvent = async (req, res) => {
  const {
    title,
    organizer,
    type,
    category,
    price,
    start_date,
    end_date,
    start_time,
    end_time,
    type_location,
    technical,
    description,
    language,
    tags
  } = req.body;

  const userRole = req.role;

  if (req.files === null)
    return res.status(400).json({ msg: "No File Uploaded" });

  const file = req.files.inputFile;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
  const allowedType = [".png", ".jpg", "jpeg"];

  if (!allowedType.includes(ext.toLocaleLowerCase()))
    return res.status(422).json({ msg: "Invalid Image" });
  if (fileSize > 2000000)
    return res.status(422).json({ msg: "Image must be less than 2MB" });

  const imagePath = path.join(__dirname, '../public/images/', fileName);

  file.mv(imagePath, async (err) => {
    if (err) return res.status(500).json({ msg: err.message });
  });

  try {
    // Buat event tanpa menyertakan tag terlebih dahulu
    const newEvent = await Event.create({
      userId: req.userId,
      title: title,
      organizer: userRole === 'admin' ? "Official Eventplan" : organizer,
      type: type,
      category: category,
      price: price,
      start_date: start_date,
      end_date: end_date,
      start_time: start_time,
      end_time: end_time,
      type_location: type_location,
      technical: technical,
      description: description,
      language: language,
      admin_validation: userRole === 'admin' ? "Approved" :  "Reviewed",
      image: fileName,
      url: url,
      tags: tags,
    });

    res.status(201).json({ msg: "Event created successfully" });
  } catch (error) {
    res.status(501).json({ msg: error.message });
    console.log(error);
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
      res.status(404).json({ msg: "Event not found" });
    }

    let fileName = "";

    if (req.files === null || req.files.inputFile === undefined) {
      fileName = event.image;
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

      // Delete the existing file
      const filepath = path.join(__dirname, '../public/images', event.image);
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
      title,
      organizer,
      type,
      category,
      price,
      start_date,
      end_date,
      start_time,
      end_time,
      type_location,
      technical,
      description,
      language,
      tags
    } = req.body;
    const tagsArray = tags.split(',').map(tag => tag.trim());

    const userRole = req.role;

     await Event.update(
      {
        userId: req.userId,
        title: title,
        organizer: userRole === 'admin' ? "Official Eventplan" : organizer,
        type: type,
        category: category,
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
    res.status(201).json({msg: `Event has been updated`});
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
      res.status(404).json({ msg: "Event not found" });
    }

    const newLocation = await Event_loc.create({
      eventId: event.id,
      city,
      state,
      country,
      address,
      lat,
      long,
    });

    res.status(201).json({
      message: "Location added for event",
      location: newLocation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
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
    const { checklistId, item, status } = req.body;

    const existingChecklist = await Event_check.findOne({
      where: {
        id: checklistId,
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
  const event = await Event.findOne({
    where: {
      uuid: req.params.uuid,
    },
  });

  if (!event) {
    res.status(404).json({ msg: "Event not found" });
  }

  try {
    const { checklistId } = req.body;

    const existingChecklist = await Event_check.findOne({
      where: {
        id: checklistId,
        eventId: event.id,
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
  const event = await Event.findOne({
    where: {
      uuid: req.params.uuid,
    },
  });
  if (!event) {
    res.status(404).json({ msg: "Event not found" });
  }

  if (!event.image) {
    return res.status(404).json({ msg: "Image not found" });
  }

  // Hapus file gambar dari direktori
  const imagePath = path.join(__dirname, `../public/images/${event.image}`);
  fs.unlinkSync(imagePath);

  try {
    await Event.destroy({
      where: {
        id: event.id,
      },
    });
    res.status(201).json("event succes has delete");
  } catch (error) {
    res.status(501).json({ msg: error.message });
    console.log(error);
  }
};

export const updateEventValidation = async (req, res) => {
  const { admin_validation } = req.body;
  try {
    // Pastikan pengguna yang memanggil fungsi memiliki role "admin"
    if (req.role !== "admin") {
      return res
        .status(403)
        .json({
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

    res.status(200).json({
      message: "Event removed from favorites",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};
