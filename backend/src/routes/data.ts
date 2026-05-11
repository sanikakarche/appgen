import { Router } from 'express';
import { pool } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router({ mergeParams: true });
router.use(authMiddleware);

router.get('/:appId/:collection', async (req: AuthRequest, res) => {
  try {
    const app = await pool.query('SELECT * FROM apps WHERE id = $1 AND user_id = $2', [req.params.appId, req.userId]);
    if (!app.rows[0]) return res.status(404).json({ error: 'App not found' });
    const result = await pool.query(
      'SELECT * FROM app_data WHERE app_id = $1 AND collection = $2 ORDER BY created_at DESC',
      [req.params.appId, req.params.collection]
    );
    res.json(result.rows);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.post('/:appId/:collection', async (req: AuthRequest, res) => {
  try {
    const app = await pool.query('SELECT * FROM apps WHERE id = $1 AND user_id = $2', [req.params.appId, req.userId]);
    if (!app.rows[0]) return res.status(404).json({ error: 'App not found' });
    const result = await pool.query(
      'INSERT INTO app_data (app_id, collection, data) VALUES ($1, $2, $3) RETURNING *',
      [req.params.appId, req.params.collection, JSON.stringify(req.body)]
    );
    res.json(result.rows[0]);
  } catch { res.status(500).json({ error: 'Server error' }); }
});

router.put('/:appId/:collection/:recordId', async (req: AuthRequest, res) => {
  const result = await pool.query(
    'UPDATE app_data SET data = $1 WHERE id = $2 AND app_id = $3 RETURNING *',
    [JSON.stringify(req.body), req.params.recordId, req.params.appId]
  );
  res.json(result.rows[0]);
});

router.delete('/:appId/:collection/:recordId', async (req: AuthRequest, res) => {
  await pool.query('DELETE FROM app_data WHERE id = $1 AND app_id = $2', [req.params.recordId, req.params.appId]);
  res.json({ success: true });
});

router.post('/:appId/:collection/import-csv', upload.single('file'), async (req: AuthRequest, res) => {
  try {
    const app = await pool.query('SELECT * FROM apps WHERE id = $1 AND user_id = $2', [req.params.appId, req.userId]);
    if (!app.rows[0]) return res.status(404).json({ error: 'App not found' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const csv = req.file.buffer.toString('utf-8');
    const lines = csv.split('\n').filter(l => l.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const inserted = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length !== headers.length) continue;
      const record: any = {};
      headers.forEach((h, idx) => { record[h] = values[idx]; });
      const result = await pool.query(
        'INSERT INTO app_data (app_id, collection, data) VALUES ($1, $2, $3) RETURNING *',
        [req.params.appId, req.params.collection, JSON.stringify(record)]
      );
      inserted.push(result.rows[0]);
    }
    res.json({ success: true, imported: inserted.length });
  } catch { res.status(500).json({ error: 'CSV import failed' }); }
});

export default router;