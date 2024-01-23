import Event from "../models/EventModel.js";
import Event_img from "../models/EventImageModel.js";
import Event_tags from "../models/EventTagsModel.js";
import Event_loc from "../models/EventLocationModel.js";
import Event_check from "../models/EventChecklistModel.js";
import User from "../models/UsersModel.js";

export const getAllEvent = async (req, res) => {
  try {
    const response = await Event.findAll({
      include: [
        {
          model: Event_img,
          model: Event_tags,
          model: Event_loc,
        },
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
            model: Event_tags,
            model: Event_loc,
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
  const eventId = req.params.eventId;
  try {
    const response = await Event.findByPk(eventId, {
      include: [
        {
          model: Event_img,
          model: Event_tags,
          model: Event_loc,
          model: Event_check,
        },
      ],
    });

    if (!response) {
      res.status(404).json({ msg: "Event not found" });
    } else {
      res.status(200).json(response);
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
  } = req.body;
  try {
    const event = await Event.create({
      userId: req.userId,
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
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
    console.log(error);
  }
};
