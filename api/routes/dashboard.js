const express = require('express');
const router = express.Router();
const { poolConnect, sql } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// GET /stats - Get dashboard statistics
router.get('/stats', [verifyToken, checkRole([1, 2, 3, 4])], async (req, res) => {
    try {
        const pool = await poolConnect;
        const result = await pool.request().execute('usp_GetDashboardStats');
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('SQL error on GET /api/dashboard/stats:', err);
        res.status(500).send({ message: 'Failed to retrieve dashboard stats.', error: err.message });
    }
});

module.exports = router;
