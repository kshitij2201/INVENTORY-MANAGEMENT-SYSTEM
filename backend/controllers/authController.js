const User = require('../models/User');
const { sendTokenResponse } = require('../utils/tokenUtils');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (In production, restrict to admin only)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, permissions } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user data object
    const userData = {
      name,
      email,
      password,
      role: role || 'staff',
    };

    // Add feature permissions if provided
    if (permissions) {
      userData.featurePermissions = permissions;
    }

    // Create user
    const user = await User.create(userData);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering user',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been disabled',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error logging in',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting user',
    });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    // Convert featurePermissions Map to plain object for each user
    const usersWithPermissions = users.map(user => {
      const userObj = user.toObject();
      
      // Convert Map to plain object if featurePermissions exists
      if (userObj.featurePermissions && userObj.featurePermissions instanceof Map) {
        const permissionsObj = {};
        userObj.featurePermissions.forEach((value, key) => {
          permissionsObj[key] = value;
        });
        userObj.featurePermissions = permissionsObj;
      } else if (userObj.featurePermissions) {
        // Already an object, convert it properly
        const permissionsObj = {};
        for (const [key, value] of Object.entries(userObj.featurePermissions)) {
          permissionsObj[key] = value;
        }
        userObj.featurePermissions = permissionsObj;
      }
      
      return userObj;
    });

    res.status(200).json({
      success: true,
      count: usersWithPermissions.length,
      data: usersWithPermissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error getting users',
    });
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating user role',
    });
  }
};

// @desc    Update user permissions (Admin only)
// @route   PUT /api/auth/users/:id/permissions
// @access  Private/Admin
exports.updateUserPermissions = async (req, res) => {
  try {
    const { permissions } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { featurePermissions: permissions },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Permissions updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating user permissions',
    });
  }
};

// @desc    Deactivate user (Admin only)
// @route   PUT /api/auth/users/:id/deactivate
// @access  Private/Admin
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deactivated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deactivating user',
    });
  }
};
