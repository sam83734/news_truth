import { Request, Response } from 'express';
import { db } from '../data/db';

export const getNotifications = (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      count: db.notifications.length,
      unreadCount: db.notifications.filter((n) => !n.isRead).length,
      data: db.notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving notifications', error });
  }
};

export const markNotificationAsRead = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notif = db.notifications.find((n) => n.id === id);

    if (!notif) {
      return res.status(404).json({ success: false, message: `Notification with ID ${id} not found` });
    }

    notif.isRead = true;

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notif,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating notification', error });
  }
};

export const markAllNotificationsAsRead = (_req: Request, res: Response) => {
  try {
    db.notifications.forEach((n) => {
      n.isRead = true;
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: db.notifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error marking all notifications as read', error });
  }
};
