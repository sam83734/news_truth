import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SupportTicket, NewsletterSubscriber } from '../types';

// In-memory support and newsletter store
export const supportTickets: SupportTicket[] = [
  {
    id: 'ticket_1',
    name: 'Anonymous Citizen',
    email: 'whistleblower@protonmail.com',
    subject: 'Municipal contract discrepancy proof (District 4)',
    message: 'I have attached documentation showing private developer filings signed 6 months prior to public rezoning disclosure. Please investigate before city council vote next week.',
    category: 'WHISTLEBLOWER_TIP',
    status: 'INVESTIGATING',
    isAnonymous: true,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'ticket_2',
    name: 'Vikram Joshi',
    email: 'v.joshi@outlook.com',
    subject: 'Inquiry regarding DLT truth verification on local dispatch',
    message: 'Could you clarify how local citizen reporters can run an independent validator node to guarantee news safety in our sector?',
    category: 'GENERAL',
    status: 'OPEN',
    isAnonymous: false,
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
  },
];

export const newsletterSubscribers: NewsletterSubscriber[] = [
  { id: 'sub_1', email: 'reader1@susalabs.com', subscribedAt: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 'sub_2', email: 'dispatch-alert@journalism.org', subscribedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
];

export const createSupportTicket = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message, category = 'GENERAL', isAnonymous = false } = req.body;

    if (!message || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required for editorial support / whistleblower desk.',
      });
    }

    const newTicket: SupportTicket = {
      id: `ticket_${uuidv4().substring(0, 8)}`,
      name: isAnonymous ? 'Encrypted Anonymous Witness' : (name?.trim() || 'Anonymous Reader'),
      email: isAnonymous ? 'anonymous@encrypted.truth' : (email?.trim() || 'reader@nexttruth.media'),
      subject: subject.trim(),
      message: message.trim(),
      category: ['WHISTLEBLOWER_TIP', 'CENSORSHIP_REPORT', 'FACT_CHECK', 'GENERAL'].includes(category)
        ? category
        : 'GENERAL',
      status: 'OPEN',
      isAnonymous: Boolean(isAnonymous),
      createdAt: new Date().toISOString(),
    };

    supportTickets.unshift(newTicket);

    res.status(201).json({
      success: true,
      message: isAnonymous
        ? 'Your tip has been transmitted through our secure, zero-knowledge editorial desk. Thank you for protecting the truth.'
        : 'Support request received. Next Truth editorial desk will review your inquiry shortly.',
      data: newTicket,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error submitting support ticket', error });
  }
};

export const getSupportTickets = async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      count: supportTickets.length,
      data: supportTickets,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching tickets', error });
  }
};

export const updateTicketStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ticket = supportTickets.find((t) => t.id === id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Support ticket not found.' });
    }

    if (status && ['OPEN', 'INVESTIGATING', 'RESOLVED'].includes(status)) {
      ticket.status = status;
    }

    res.json({
      success: true,
      message: `Ticket status updated to ${ticket.status}`,
      data: ticket,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error updating ticket', error });
  }
};

export const subscribeNewsletter = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address to subscribe.',
      });
    }

    const emailTrimmed = email.toLowerCase().trim();
    const existing = newsletterSubscribers.find((s) => s.email === emailTrimmed);

    if (existing) {
      return res.json({
        success: true,
        message: 'You are already subscribed to Next Truth Dispatch & SusaLabs intelligence alerts!',
        data: existing,
      });
    }

    const newSub: NewsletterSubscriber = {
      id: `sub_${uuidv4().substring(0, 8)}`,
      email: emailTrimmed,
      subscribedAt: new Date().toISOString(),
    };

    newsletterSubscribers.push(newSub);

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing! You will receive our weekly top investigative reports and DLT truth bulletins.',
      data: newSub,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error subscribing to newsletter', error });
  }
};

export const getNewsletterSubscribers = async (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      count: newsletterSubscribers.length,
      data: newsletterSubscribers,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error?.message || 'Error fetching subscribers', error });
  }
};

