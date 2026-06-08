const express = require('express');
const router = express.Router();

const {createCourse, getCourses, getCourseById, updateCourse, deleteCourse} = require('../controllers/course.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

router.get('/', getCourses);
router.get('/:id', getCourseById);

router.post('/', protect, authorizeRoles('instructor', 'admin'), createCourse);
router.put('/:id', protect, updateCourse);
router.delete('/:id', protect, deleteCourse);

module.exports = router;