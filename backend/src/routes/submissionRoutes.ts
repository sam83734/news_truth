import { Router } from 'express';
import {
  getSubmissions,
  createSubmission,
  updateSubmissionStatus,
} from '../controllers/submissionController';

const router = Router();

router.get('/', getSubmissions);
router.post('/', createSubmission);
router.patch('/:id/status', updateSubmissionStatus);

export default router;
