import { Router } from 'express';
import {
  getArticles,
  getHeroArticle,
  getOpinionArticle,
  getPremiumColumn,
  getPublishedBentoArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/articleController';

const router = Router();

router.get('/', getArticles);
router.get('/hero', getHeroArticle);
router.get('/opinion', getOpinionArticle);
router.get('/columns', getPremiumColumn);
router.get('/bento/published', getPublishedBentoArticles);
router.get('/:id', getArticleById);
router.post('/', createArticle);
router.put('/:id', updateArticle);
router.delete('/:id', deleteArticle);

export default router;
