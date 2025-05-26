import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Portfolio API is running! 🚀');
});

// PROJECTS ROUTES
app.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { images: true }
    });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/projects/:id', async (req, res) => {
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
});

app.post('/projects', async (req, res) => {
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
});

//IMAGES ROUTES
app.get('/images', async (req, res) => {
  try {
    const images = await prisma.image.findMany({
      include: { project: true }
    });
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/images/:id', async (req, res) => {
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
});

app.post('/images', async (req, res) => {
  try {
    const { url, caption, order, projectId } = req.body;

    const newImage = await prisma.image.create({
      data: {
        url,
        caption,
        order,
        projectId  // valfritt
      }
    });

    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error creating image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//EXPERIENCE ROUTES
app.get('/experiences', async (req, res) => {
  try {
    const experiences = await prisma.experience.findMany();
    res.json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/experiences', async (req, res) => {
  try {
    const { title, category, description, startDate, endDate } = req.body;

    const newExperience = await prisma.experience.create({
      data: {
        title,
        category,
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
});

// USER ROUTES
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { name, email, passwordHash, role } = req.body;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role
      }
    });

    res.status(201).json({ message: "User created", id: user.id });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});