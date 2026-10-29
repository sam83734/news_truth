import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  upgradePremium,
  getBookmarks,
  toggleBookmark,
} from '../controllers/userController';

const router = Router();

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.post('/upgrade-premium', upgradePremium);
router.get('/bookmarks', getBookmarks);
router.post('/bookmarks/:articleId', toggleBookmark);

export default router;
