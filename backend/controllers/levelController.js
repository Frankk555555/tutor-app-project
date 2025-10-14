const pool = require('../models/db');

exports.getAllLevels = async (req, res) => {
    try {
        const [levels] = await pool.query('SELECT * FROM levels ORDER BY id');
        res.json(levels);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};