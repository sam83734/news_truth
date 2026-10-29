import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ArticleModel } from '../models/Article';
import { db } from '../data/db';
import { Article } from '../types';
import { v4 as uuidv4 } from 'uuid';

/** Compute a human-readable relative-time string from a createdAt ISO timestamp */
const getRelativeTime = (iso?: string): string => {
  if (!iso) return 'Just now';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

/** Enrich an article object with dynamic dateOrTimeAgo from createdAt */
const enrichArticle = (a: any): any => {
  const plain = a.toJSON ? a.toJSON() : { ...a };
  if (plain.createdAt) {
    plain.dateOrTimeAgo = getRelativeTime(plain.createdAt);
  }
  return plain;
};

export const getArticles = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let articles: any[] = [];

    if (mongoose.connection.readyState === 1) {
      const query: any = {};
      if (category && typeof category === 'string' && category !== 'All') {
        query.category = category;
      }
      if (search && typeof search === 'string' && search.trim()) {
        query.$or = [
          { title: { $regex: search.trim(), $options: 'i' } },
          { excerpt: { $regex: search.trim(), $options: 'i' } },
          { authorName: { $regex: search.trim(), $options: 'i' } },
        ];
      }
      articles = await ArticleModel.find(query).sort({ createdAt: -1 });
    }

    if (articles.length === 0) {
      let filtered = [...db.articles];
      if (category && typeof category === 'string' && category !== 'All') {
        filtered = filtered.filter(
          (a) => a.category.toLowerCase() === category.toLowerCase()
        );
      }
      if (search && typeof search === 'string' && search.trim()) {
        const q = search.toLowerCase().trim();
        filtered = filtered.filter(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.excerpt.toLowerCase().includes(q) ||
            a.authorName.toLowerCase().includes(q)
        );
      }
      articles = filtered;
    }

    res.json({
      success: true,
      count: articles.length,
      data: articles.map(enrichArticle),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching articles', error });
  }
};

export const getHeroArticle = async (_req: Request, res: Response) => {
  try {
    let hero: any = null;

    if (mongoose.connection.readyState === 1) {
      hero = await ArticleModel.findOne({ isHero: true });
    }

    if (!hero) {
      hero = db.articles.find((a) => a.isHero) || db.articles[0];
    }

    res.json({ success: true, data: hero ? enrichArticle(hero) : null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching hero article', error });
  }
};

export const getOpinionArticle = async (_req: Request, res: Response) => {
  try {
    let op: any = null;

    if (mongoose.connection.readyState === 1) {
      op = await ArticleModel.findOne({ isOpinion: true });
    }

    if (!op) {
      op = db.articles.find((a) => a.isOpinion) || db.articles[1];
    }

    res.json({ success: true, data: op ? enrichArticle(op) : null });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching opinion article', error });
  }
};

export const getPremiumColumns = async (_req: Request, res: Response) => {
  try {
    let premiumColumn: any = null;
    let moreAuthorArticles: any[] = [];

    if (mongoose.connection.readyState === 1) {
      premiumColumn = await ArticleModel.findOne({ isAuthorColumn: true });
      moreAuthorArticles = await ArticleModel.find({
        isAuthorColumn: false,
        $or: [{ authorName: /Sarah/i }, { category: 'Technology' }],
      }).limit(4);
    }

    if (!premiumColumn) {
      premiumColumn = db.articles.find((a) => a.isAuthorColumn) || db.articles[2];
      moreAuthorArticles = db.articles.filter((a) => !a.isAuthorColumn).slice(0, 3);
    }

    res.json({
      success: true,
      data: {
        premiumColumn: premiumColumn ? enrichArticle(premiumColumn) : null,
        moreAuthorArticles: moreAuthorArticles.map(enrichArticle),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching columns', error });
  }
};

export const getPremiumColumn = getPremiumColumns;

export const getPublishedBento = async (_req: Request, res: Response) => {
  try {
    let bento: any[] = [];

    if (mongoose.connection.readyState === 1) {
      bento = await ArticleModel.find({ isBentoPublished: true });
    }

    if (bento.length === 0) {
      bento = db.articles.filter((a) => a.isBentoPublished);
    }

    res.json({ success: true, count: bento.length, data: bento.map(enrichArticle) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching bento articles', error });
  }
};

export const getPublishedBentoArticles = getPublishedBento;

export const getArticleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let article: any = null;

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId ? { _id: id } : { customId: id };
      article = await ArticleModel.findOne(query);
    }

    if (!article) {
      article = db.articles.find((a) => a.id === id);
    }

    if (!article) {
      return res.status(404).json({ success: false, message: `Article with ID ${id} not found` });
    }

    res.json({ success: true, data: enrichArticle(article) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching article', error });
  }
};

export const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, excerpt, fullContent, authorName, authorTitle, category, imageUrl } = req.body;

    if (!title || !authorName) {
      return res.status(400).json({ success: false, message: 'Title and author name are required.' });
    }

    const newArticleData = {
      customId: `art_${uuidv4().substring(0, 8)}`,
      title: title.trim(),
      excerpt: excerpt || '',
      fullContent: fullContent || '',
      authorName: authorName.trim(),
      authorTitle: authorTitle || 'Staff Journalist',
      authorAvatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120&h=120',
      dateOrTimeAgo: 'Just now',
      category: category || 'Ground Report',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800',
    };

    let created: any = null;
    if (mongoose.connection.readyState === 1) {
      created = await ArticleModel.create(newArticleData);
    }

    const memArticle: Article = {
      id: created ? created._id.toString() : newArticleData.customId,
      ...newArticleData,
    };
    db.articles.unshift(memArticle);

    res.status(201).json({ success: true, data: created || memArticle });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error creating article', error });
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let updated: any = null;

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId ? { _id: id } : { customId: id };
      updated = await ArticleModel.findOneAndUpdate(query, req.body, { new: true });
    }

    const memArt = db.articles.find((a) => a.id === id);
    if (memArt) {
      Object.assign(memArt, req.body);
    }

    if (!updated && !memArt) {
      return res.status(404).json({ success: false, message: `Article ${id} not found` });
    }

    res.json({ success: true, data: updated || memArt });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error updating article', error });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId ? { _id: id } : { customId: id };
      await ArticleModel.findOneAndDelete(query);
    }

    db.articles = db.articles.filter((a) => a.id !== id);

    res.json({ success: true, message: `Article ${id} deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error deleting article', error });
  }
};
