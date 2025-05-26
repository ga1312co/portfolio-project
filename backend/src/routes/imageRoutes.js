import express from 'express';
import { getAllImages, getImageById, createImage } from '../controllers/imageController.js';

const router = express.Router();

router.get('/', getAllImages);
router.get('/:id', getImageById);
router.post('/', createImage);

export default router;
