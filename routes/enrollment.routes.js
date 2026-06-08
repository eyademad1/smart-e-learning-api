const express = require('express');
const router = express.Router();

const { enrollCourse, getMyCourses, getCourseEnrollments, checkEnrollmentStatus } = require('../controllers/enrollment.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

router.post('/:courseId', protect, authorizeRoles('student'), enrollCourse);
router.get('/my-courses', protect, getMyCourses);
router.get('/status/:courseId', protect, authorizeRoles('student'), checkEnrollmentStatus);
router.get('/course/:courseId', protect, authorizeRoles('instructor', 'admin'), getCourseEnrollments);

module.exports = router;