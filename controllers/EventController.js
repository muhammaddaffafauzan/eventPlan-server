import Event from "../models/EventModel.js";
import Event_img from "../models/EventImageModel.js";
import Event_tags from "../models/EventTagsModel.js";
import Event_loc from "../models/EventLocationModel.js";
import Event_check from "../models/EventChecklistModel.js";
import User from "../models/UsersModel.js";
import fs from 'fs';
import path from 'path';

export const getAllEvent = async (req, res) => {
  try {
    const response = await Event.findAll({
      include: [
        {
          model: Event_img,
        },
        {
          model: Event_tags,
        },
        {
          model: Event_loc,
        }
      ],
    });
    res.status(201).json(response);
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
            model: Event_img,
          },
          {
            model: Event_tags,
          },
          {
            model: Event_loc,
          },
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

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findOne({
      where: {
        uuid: req.params.uuid,
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
        }
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

    // Dapatkan kembali acara setelah pembaruan
    const updatedEvent = await Event.findOne({
      where: {
        uuid: req.params.uuid,
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
        {
          model: Event_check,
        },
      ],
    });

    res.status(200).json(updatedEvent);
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
  try {
  const newEvent =  await Event.create({
      userId: req.userId,
      title: title,
      organizer: organizer,
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
    });
    await Event_tags.create({
      eventId: newEvent.id,
      tags: tags
    })
    res.status(201).json("event succes has create");
  } catch (error) {
    res.status(501).json({ msg: error.message });
    console.log(error);
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

    // Tambahkan lokasi event ke dalam database
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

export const addImageForEvent = async (req, res) => {
  const event = await Event.findOne({
    where: {
      uuid: req.params.uuid,
    },
  });
  if (!event) {
    res.status(404).json({ msg: "Event not found" });
  }
  try {
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
    const newImage = await Event_img.create({
      eventId: event.id,
      image: fileName,
      url: url,
    });
    res.status(201).json({
      message: "Upload success",
      image: newImage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};

export const deleteImageForEvent = async (req, res) => {
  const { uuid, imageId } = req.params;

  // Temukan event berdasarkan uuid
  const event = await Event.findOne({
    where: {
      uuid: uuid,
    },
  });

  if (!event) {
    res.status(404).json({ msg: "Event not found" });
  }

  try {
    // Temukan informasi gambar berdasarkan id
    const image = await Event_img.findOne({
      where: {
        id: imageId,
        eventId: event.id,
      },
    });

    if (!image) {
      return res.status(404).json({ msg: "Image not found" });
    }

    // Hapus file gambar dari direktori
    const imagePath = path.join(__dirname, `../public/images/${image.image}`);
    fs.unlinkSync(imagePath);

    // Hapus informasi gambar dari database
    await Event_img.destroy({
      where: {
        id: imageId,
      },
    });

    res.status(200).json({ msg: "Image deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
    console.log(error);
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
    existingChecklist.status = status !== undefined ? status : existingChecklist.status;
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

export const updateEvent = async (req, res) => {
  const event = await Event.findOne({
    where: {
      uuid: req.params.uuid,
    },
  });
  if (!event) {
    res.status(404).json({ msg: "Event not found" });
  }
  try {
    await Event.update(
      {
        userId: req.userId,
        title: title,
        organizer: organizer,
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
      },
      {
        where: {
          id: event.id,
        },
      }
    );
    res.status(201).json("event has updated");
  } catch (error) {
    res.status(501).json({ msg: error.message });
    console.log(error);
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
      return res.status(403).json({ msg: "Access forbidden. Only admin can update validation status." });
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
