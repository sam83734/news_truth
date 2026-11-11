import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CategoryModel } from '../models/Category';
import { BannerModel } from '../models/Banner';
import { LayoutConfigModel } from '../models/LayoutConfig';
import { db } from '../data/db';

export const getHealth = (_req: Request, res: Response) => {
  const mongoStatus =
    mongoose.connection.readyState === 1
      ? 'connected'
      : mongoose.connection.readyState === 2
      ? 'connecting'
      : 'in-memory-fallback';

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    platform: 'Next Truth News API',
    database: `MongoDB (${mongoStatus})`,
    environment: process.env.NODE_ENV || 'development',
  });
};

export const getCategories = async (_req: Request, res: Response) => {
  try {
    let categories: any[] = [];

    if (mongoose.connection.readyState === 1) {
      categories = await CategoryModel.find();
    }

    if (categories.length === 0) {
      // Seed categories into MongoDB if empty
      if (mongoose.connection.readyState === 1) {
        try {
          await CategoryModel.insertMany(db.categories);
        } catch {
          // ignore duplicate
        }
      }
      categories = db.categories;
    }

    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching categories', error });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newCat = {
      id: `cat_${Date.now()}`,
      name: cleanName,
      slug,
      description: description ? description.trim() : `Channel for ${cleanName}`,
    };

    if (mongoose.connection.readyState === 1) {
      await CategoryModel.findOneAndUpdate({ slug }, newCat, { upsert: true, new: true });
    }

    const existingIdx = db.categories.findIndex((c) => c.slug === slug);
    if (existingIdx >= 0) {
      db.categories[existingIdx] = newCat;
    } else {
      db.categories.push(newCat);
    }

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: newCat,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error creating category', error });
  }
};

export const getLayoutConfig = async (_req: Request, res: Response) => {
  try {
    let config: any = null;
    if (mongoose.connection.readyState === 1) {
      config = await LayoutConfigModel.findOne();
    }
    if (!config) {
      config = db.layoutConfig;
    }
    const finalConfig = config.toJSON ? config.toJSON() : config;
    res.json({
      success: true,
      data: finalConfig,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching layout config', error });
  }
};

export const updateLayoutConfig = async (req: Request, res: Response) => {
  try {
    const { heroBannerCategory, secondaryBannerCategory, secondaryBannerTitle, videoSectionCategory } = req.body;

    const updatePayload: any = {};
    if (heroBannerCategory) updatePayload.heroBannerCategory = heroBannerCategory.trim();
    if (secondaryBannerCategory) updatePayload.secondaryBannerCategory = secondaryBannerCategory.trim();
    if (secondaryBannerTitle) updatePayload.secondaryBannerTitle = secondaryBannerTitle.trim();
    if (videoSectionCategory) updatePayload.videoSectionCategory = videoSectionCategory.trim();

    let updated: any = null;
    if (mongoose.connection.readyState === 1) {
      updated = await LayoutConfigModel.findOneAndUpdate({}, updatePayload, { upsert: true, new: true });
    }

    db.layoutConfig = {
      ...db.layoutConfig,
      ...updatePayload,
    };

    const finalConfig = updated ? updated.toJSON() : db.layoutConfig;
    res.json({
      success: true,
      message: 'Public page layout & channel configuration updated successfully.',
      data: finalConfig,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error updating layout config', error });
  }
};

export const getSponsoredBanner = async (_req: Request, res: Response) => {
  try {
    let banner: any = null;

    if (mongoose.connection.readyState === 1) {
      banner = await BannerModel.findOne();
    }

    if (!banner) {
      banner = db.sponsoredBanner;
    }

    res.json({
      success: true,
      data: banner,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching banner', error });
  }
};
