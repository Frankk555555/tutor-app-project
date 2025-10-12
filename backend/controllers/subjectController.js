const pool = require('../models/db');

exports.getAllSubjects = async (req, res) => {
    try {
        const [subjects] = await pool.query('SELECT id, name FROM subjects ORDER BY name ASC');
        res.json(subjects);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Server error' });
    }
};