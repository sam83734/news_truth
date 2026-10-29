import { Router } from 'express';
import {
  getVideos,
  getVideoById,
  toggleVideoLike,
  createVideo,
} from '../controllers/videoController';

const router = Router();

router.get('/', getVideos);
router.get('/:id', getVideoById);
router.post('/:id/like', toggleVideoLike);
router.post('/', createVideo);

export default router;
