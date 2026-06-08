const Enrollment = require('../models/Enrollment.js');
const Course = require('../models/Course.js');

// enroll in a course
exports.enrollCourse = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        
        const course = await Course.findById(courseId);
        if(!course){
            return res.status(404).json({ message : 'Course not found' });
        }

        // check duplicate enrollment
        const alreadyEnrolled = await Enrollment.findOne({ user : req.user._id, course : courseId });

        if(alreadyEnrolled){
            return res.status(400).json({ message : 'Already enrolled in this course' });
        }
        const enrollment = await Enrollment.create({
            user : req.user._id,
            course : courseId,
        })

        res.status(201).json(enrollment);

    } catch (error) {
        next(error);
    }
};

// get my courses
exports.getMyCourses = async (req, res, next) => {
    try {
        const enrollments = await Enrollment.find({ user : req.user._id }).populate({
            path: 'course',
            populate: {
                path: 'instructor',
                select: 'name email'
            }
        });

        res.status(200).json(enrollments);
    } catch (error) {
        next(error);
    }
};

exports.getCourseEnrollments = async (req, res, next) => {
    try {
        const enrollments = await Enrollment.find({ course: req.params.courseId }).populate('user', 'name email');
        res.status(200).json(enrollments);
    } catch (error) {
        next(error);
    }
}

exports.checkEnrollmentStatus = async (req, res, next) => {
    try {
        const enrollment = await Enrollment.findOne({ user: req.user._id, course: req.params.courseId });
        res.status(200).json({ enrolled: !!enrollment });
    } catch (error) {
        next(error);
    }
}