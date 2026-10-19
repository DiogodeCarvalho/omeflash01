import { Router, Request, Response } from 'express';
import { db } from '../db';
import { authenticateToken } from '../auth';

const router = Router();

// GET /api/admin/stats
router.get('/stats', authenticateToken, (_req: Request, res: Response) => {
  const totalVideos = db.videos.length;
  const totalPlans = db.plans.length;
  const totalViews = db.videos.reduce((acc, v) => acc + (v.views || 0), 0);
  const premiumVideos = db.videos.filter((v) => v.isPremium).length;

  const totalSubscribers = db.subscribers.length;
  const activeSubscriptions = db.subscribers.filter(
    (s) => s.subscription && s.subscription.status === 'active'
  ).length;

  // Calculate MRR
  const mrr = db.subscribers.reduce((acc, s) => {
    if (s.subscription && s.subscription.status === 'active') {
      const p = s.subscription.price;
      if (s.subscription.period.includes('ano')) {
        return acc + p / 12;
      }
      if (s.subscription.period.includes('trimestre')) {
        return acc + p / 3;
      }
      return acc + p;
    }
    return acc;
  }, 0);

  return res.json({
    totalVideos,
    totalPlans,
    totalViews,
    premiumVideos,
    totalSubscribers,
    activeSubscriptions,
    mrr: Math.round(mrr * 100) / 100,
  });
});

export default router;
