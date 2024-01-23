import Event_type from '../models/EventTypeModel.js';

export const getAllEventTypes = async (req, res) => {
  try {
    const eventTypes = await Event_type.findAll();
    res.status(200).json(eventTypes);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createEventType = async (req, res) => {
  const { type } = req.body;

  try {
    const newEventType = await Event_type.create({ type });
    res.status(201).json(newEventType);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateEventType = async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;

  try {
    const eventType = await Event_type.findByPk(id);

    if (!eventType) {
      return res.status(404).json({ msg: 'Event type not found' });
    }

    await eventType.update({ type });
    res.status(200).json({ msg: 'Event type updated successfully' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteEventType = async (req, res) => {
  const { id } = req.params;

  try {
    const eventType = await Event_type.findByPk(id);

    if (!eventType) {
      return res.status(404).json({ msg: 'Event type not found' });
    }

    await eventType.destroy();
    res.status(200).json({ msg: 'Event type deleted successfully' });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
