import { Router } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res) => {
  const result = await pool.query('SELECT * FROM apps WHERE user_id = $1 ORDER BY created_at DESC', [req.userId]);
  res.json(result.rows);
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, config } = req.body;
    if (!name || !config) return res.status(400).json({ error: 'Name and config required' });
    const result = await pool.query(
      'INSERT INTO apps (user_id, name, config) VALUES ($1, $2, $3) RETURNING *',
      [req.userId, name, JSON.stringify(config)]
    );
    res.json(result.rows[0]);
  } catch {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  const result = await pool.query('SELECT * FROM apps WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
  if (!result.rows[0]) return res.status(404).json({ error: 'App not found' });
  res.json(result.rows[0]);
});

router.put('/:id', async (req: AuthRequest, res) => {
  const { name, config } = req.body;
  const result = await pool.query(
    'UPDATE apps SET name = COALESCE($1, name), config = COALESCE($2, config) WHERE id = $3 AND user_id = $4 RETURNING *',
    [name, config ? JSON.stringify(config) : null, req.params.id, req.userId]
  );
  res.json(result.rows[0]);
});

router.delete('/:id', async (req: AuthRequest, res) => {
  await pool.query('DELETE FROM apps WHERE id = $1 AND user_id = $2', [req.params.id, req.userId]);
  res.json({ success: true });
});

export default router;