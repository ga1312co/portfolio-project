import { prisma } from '../server.js';

export const getAllExperiences = async (req, res) => {
  try {
    const experiences = await prisma.experience.findMany();
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
