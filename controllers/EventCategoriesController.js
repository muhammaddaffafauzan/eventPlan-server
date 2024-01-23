import Event_category from '../models/EventCategoryModel.js';

export const getAllEventCategories = async (req, res) => {
  try {
    const eventCategories = await Event_category.findAll();
    res.status(200).json(eventCategories);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createEventCategory = async (req, res) => {
  const { category } = req.body;

  try {
    const newEventCategory = await Event_category.create({ category });
    res.status(201).json(newEventCategory);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateEventCategory = async (req, res) => {
  const { id } = req.params;
  const { category } = req.body;

  try {
    const eventCategory = await Event_category.findByPk(id);

    if (!eventCategory) {
      return res.status(404).json({ msg: 'Event category not found' });
    }

    await eventCategory.update({ category });
    res.status(200).json({ msg: 'Event category updated successfully' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteEventCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const eventCategory = await Event_category.findByPk(id);

    if (!eventCategory) {
      return res.status(404).json({ msg: 'Event category not found' });
    }

    await eventCategory.destroy();
    res.status(200).json({ msg: 'Event category deleted successfully' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
