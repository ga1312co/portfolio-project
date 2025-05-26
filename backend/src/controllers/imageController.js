import { prisma } from '../server.js';

export const getAllImages = async (req, res) => {
  try {
    const images = await prisma.image.findMany({
      include: { project: true }
    });
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getImageById = async (req, res) => {
  const { id } = req.params;
  try {
    const image = await prisma.image.findUnique({
      where: { id: parseInt(id) },
      include: { project: true }
    });
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.json(image);
  } catch (error) {
    console.error('Error fetching image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createImage = async (req, res) => {
  try {
    const { url, caption, projectId, experienceId } = req.body;

    const newImage = await prisma.image.create({
      data: {
        url,
        caption,
        projectId,
        experienceId
      }
    });

    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error creating image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
