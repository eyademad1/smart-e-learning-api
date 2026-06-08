const Course = require('../models/Course.js');
const Enrollment = require('../models/Enrollment.js');
const jwt = require('jsonwebtoken');

// create course 
exports.createCourse = async (req, res, next) => {
    try {
        const course = await Course.create({
            ...req.body,
            instructor : req.user._id
        })
        res.status(201).json(course);
    } catch (error) {
        next(error);
    }
};

// get all courses
exports.getCourses = async (req, res, next) => {
    try {
        const { keyword, category, instructor, page = 1, limit = 5} = req.query;
        let query = {};

        // search by keyword
        if (keyword) {
            query.title = { $regex: keyword, $options: "i"};
        }

        // filter by category
        if (category) {
            query.category = category;
        }

        // filter by instructor
        if (instructor) {
            query.instructor = instructor;
        }

        const courses = await Course.find(query)
        .populate('instructor', 'name email')
        .select('-lessons') // Don't send lessons in list view
        .skip((page - 1) * limit )
        .limit(Number(limit));

        const total = await Course.countDocuments(query);

        res.json({
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            courses,
        });
    } catch (error) {
        next(error);
    }
}

// get single course
exports.getCourseById = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id).populate('instructor', 'name email');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is authorized to see lessons
        let canViewLessons = false;
        
        // Extract token from header if it exists
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decoded.id;
                const userRole = decoded.role; // Assuming role is in token

                // Admin or Instructor of the course
                if (userRole === 'admin' || course.instructor._id.toString() === userId) {
                    canViewLessons = true;
                } else {
                    // Check enrollment
                    const enrollment = await Enrollment.findOne({ user: userId, course: course._id });
                    if (enrollment) {
                        canViewLessons = true;
                    }
                }
            } catch (err) {
                // Token invalid, keep canViewLessons false
            }
        }

        const courseObj = course.toObject();
        if (!canViewLessons) {
            // Hide sensitive data if not authorized
            if (courseObj.lessons) {
                courseObj.lessons = courseObj.lessons.map(lesson => ({
                    title: lesson.title,
                    // Hide content and videoUrl
                    content: 'Content locked. Please enroll to view.',
                    videoUrl: null
                }));
            }
        }

        res.status(200).json(courseObj);
    } catch (error) {
        next(error);
    }
}

// update course
exports.updateCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

            // check if the user is the instructor of the course
            if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'You are not authorized to update this course' });
            }
            
            const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.status(200).json(updatedCourse);
    } catch (error) {
        next(error);
    }
}

// delete course
exports.deleteCourse = async (req, res, next) => {
    try {
        const course = await Course.findById(req.params.id);
        if(!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if(course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You are not authorized to delete this course' });
        }

        await course.deleteOne();
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        next(error);
    }
}