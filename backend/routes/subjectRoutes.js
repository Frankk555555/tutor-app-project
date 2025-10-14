const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');


// GET /api/subjects -> ดึงรายชื่อวิชาทั้งหมด
router.get('/', subjectController.getAllSubjects);

router.get('/search', subjectController.searchSubjects);

module.exports = router;