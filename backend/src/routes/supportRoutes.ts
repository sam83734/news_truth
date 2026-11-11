import { Router } from 'express';
import {
  createSupportTicket,
  getSupportTickets,
  updateTicketStatus,
  subscribeNewsletter,
  getNewsletterSubscribers,
} from '../controllers/supportController';

const router = Router();

router.post('/ticket', createSupportTicket);
router.get('/tickets', getSupportTickets);
router.patch('/tickets/:id', updateTicketStatus);
router.post('/newsletter/subscribe', subscribeNewsletter);
router.get('/newsletter/subscribers', getNewsletterSubscribers);

export default router;

