import { Router } from 'express';
import {
  submitLead,
  getLeads,
  getLeadById,
  updateLeadStatus,
  reanalyzeLead,
  getStats,
  recentLeads,
  getConfigInfo,
  testTelegram,
} from '../controllers/leads';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public capture route
router.post('/submit', submitLead);

// Authenticated administration routes
router.get('/', authenticateToken as any, getLeads as any);
router.get('/stats', authenticateToken as any, getStats as any);
router.get('/recent', authenticateToken as any, recentLeads as any);
router.get('/config-info', authenticateToken as any, getConfigInfo as any);
router.post('/test-telegram', authenticateToken as any, testTelegram as any);
router.get('/:id', authenticateToken as any, getLeadById as any);
router.patch('/:id/status', authenticateToken as any, updateLeadStatus as any);
router.post('/:id/reanalyze', authenticateToken as any, reanalyzeLead as any);

export default router;
