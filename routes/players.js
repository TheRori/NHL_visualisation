// routes/players.js
import express from 'express';
import db from '../db/database.js';

const router = express.Router();

// Route pour récupérer les données des joueurs suisses
router.get('/', (req, res) => {
    db.all('SELECT * FROM swiss_player_stats', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

export default router;
