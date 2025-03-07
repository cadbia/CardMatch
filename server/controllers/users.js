import User from '../models/User.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, preferences } = req.body;
    
    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (preferences) updateFields.preferences = preferences;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
export const updatePreferences = async (req, res, next) => {
  try {
    const { categories, annualFeePreference, creditScoreRange } = req.body;
    
    // Build preferences object
    const preferences = {};
    if (categories) preferences.categories = categories;
    if (annualFeePreference) preferences.annualFeePreference = annualFeePreference;
    if (creditScoreRange) preferences.creditScoreRange = creditScoreRange;
    
    // Update user preferences
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user.preferences
    });
  } catch (error) {
    next(error);
  }
};