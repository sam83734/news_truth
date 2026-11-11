import { Router } from 'express';
import {
  getCategories,
  createCategory,
  getSponsoredBanner,
  getHealth,
  getLayoutConfig,
  updateLayoutConfig,
} from '../controllers/metaController';

const router = Router();

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.get('/layout-config', getLayoutConfig);
router.put('/layout-config', updateLayoutConfig);
router.get('/banners/sponsored', getSponsoredBanner);
router.get('/health', getHealth);

export default router;
