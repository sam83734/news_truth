import { Router } from 'express';
import {
  getCategories,
  getSponsoredBanner,
  getHealth,
} from '../controllers/metaController';

const router = Router();

router.get('/categories', getCategories);
router.get('/banners/sponsored', getSponsoredBanner);
router.get('/health', getHealth);

export default router;
