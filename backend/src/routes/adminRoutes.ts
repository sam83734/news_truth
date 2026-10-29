import { Router } from 'express';
import {
  getAdminUsers,
  createAdminUser,
  updateSubmissionVerification,
  updateSponsoredBanner,
} from '../controllers/adminController';

const router = Router();

router.get('/users', getAdminUsers);
router.post('/users', createAdminUser);
router.patch('/submissions/:id/status', updateSubmissionVerification);
router.put('/banners/sponsored', updateSponsoredBanner);

export default router;
