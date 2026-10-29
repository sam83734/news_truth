import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { CategoryModel } from '../models/Category';
import { BannerModel } from '../models/Banner';
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
