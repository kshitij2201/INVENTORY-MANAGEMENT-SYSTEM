const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getAllUsers,
  updateUserRole,
  updateUserPermissions,
  deactivateUser,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.put('/users/:id/permissions', protect, authorize('admin'), updateUserPermissions);
router.put('/users/:id/deactivate', protect, authorize('admin'), deactivateUser);

module.exports = router;
