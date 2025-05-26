import express from 'express';
import { getAllExperiences, createExperience } from '../controllers/experienceController.js';

const router = express.Router();

router.get('/', getAllExperiences);
router.post('/', createExperience);

export default router;
