import express from 'express';
import {
  getAllExperiences,
  createExperience,
  updateExperience
} from '../controllers/experienceController.js';

const router = express.Router();

router.get('/', getAllExperiences);
router.post('/', createExperience);
router.put('/:id', updateExperience);

export default router;