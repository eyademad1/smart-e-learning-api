const express = require('express');
const router = express.Router();
const { register, login, getUsers, updateUserRole, deleteUser } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
router.post('/register', register);
router.post('/login', login);


router.get('/profile', protect, (req, res) => {
    res.json(req.user);
});


router.get('/admin', protect, authorizeRoles('admin'), (req, res) => {
    res.json({ message: 'Welcome, Admin' });
})

router.get('/users', protect, authorizeRoles('admin'), getUsers);
router.put('/users/:id/role', protect, authorizeRoles('admin'), updateUserRole);
router.delete('/users/:id', protect, authorizeRoles('admin'), deleteUser);

module.exports = router;
