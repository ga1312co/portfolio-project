import { prisma } from '../server.js';

export const getAllProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { images: true }
    });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: { images: true }
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description, order } = req.body;

    const newProject = await prisma.project.create({
      data: {
        title,
        description,
        order
      }
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
