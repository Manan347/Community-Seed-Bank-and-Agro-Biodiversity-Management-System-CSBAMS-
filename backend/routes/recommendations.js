import { Router } from 'express';
import db from '../config/db.js';
import { id, now, ok, fail } from '../utils/helpers.js';
import { requireAuth, allow } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', (_req, res) => {
  const rows = db.prepare(`SELECT r.*, u.name AS expert_name, v.name AS variety_name
    FROM expert_recommendations r
    JOIN users u ON u.user_id = r.expert_id
    LEFT JOIN seed_varieties v ON v.variety_id = r.variety_id
    ORDER BY r.recommendation_date DESC`).all();
  ok(res, rows);
});

router.post('/', allow('Agricultural Expert'), (req, res, next) => {
  try {
    const { varietyId = null, testId = null, type, content } = req.body;
    if (!type || !content || content.trim().length < 10) throw fail('Recommendation type and at least 10 characters of guidance are required');
    if (!varietyId && !testId) throw fail('Select a variety or quality test');
    const recommendationId = id('REC');
    db.prepare(`INSERT INTO expert_recommendations
      (recommendation_id, expert_id, test_id, variety_id, type, content, recommendation_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Published')`)
      .run(recommendationId, req.user.userId, testId, varietyId, type, content.trim(), now());
    ok(res, { recommendationId }, 'Recommendation published.');
  } catch (error) { next(error); }
});

export default router;
