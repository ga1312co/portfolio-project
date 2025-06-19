import { prisma } from '../server.js';

export const getAllExperiences = async (req, res) => {
  try {
    const experiences = await prisma.experience.findMany({
      include: {
        images: {
          select: {
            id: true,
            url: true,
            caption: true,
          }
        }
      }
    });

    res.json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createExperience = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    const newExperience = await prisma.experience.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null
      }
    });

    res.status(201).json(newExperience);
  } catch (error) {
    console.error('Error creating experience:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateExperience = async (req, res) => {
  const { id } = req.params;
  const { title, description, startDate, endDate } = req.body;

  try {
    const updatedExperience = await prisma.experience.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      }
    });

    res.json(updatedExperience);
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
