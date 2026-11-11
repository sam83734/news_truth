import { Router } from 'express';
import {
  getVideos,
  getVideoById,
  toggleVideoLike,
  createVideo,
  updateVideo,
  deleteVideo,
} from '../controllers/videoController';

const router = Router();

router.get('/', getVideos);
router.get('/:id', getVideoById);
router.post('/:id/like', toggleVideoLike);
router.post('/', createVideo);
router.patch('/:id', updateVideo);
router.delete('/:id', deleteVideo);

export default router;
