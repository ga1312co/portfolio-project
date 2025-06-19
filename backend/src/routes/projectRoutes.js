import express from 'express';
import { getAllProjects, getProjectById, createProject, updateProject } from '../controllers/projectController.js';

const router = express.Router();

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);


export default router;
