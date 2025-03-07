import Card from '../models/Card.js';
import User from '../models/User.js';

// @desc    Get all cards
// @route   GET /api/cards
// @access  Public
export const getCards = async (req, res, next) => {
  try {
    const cards = await Card.find();
    
    res.status(200).json({
      success: true,
      count: cards.length,
      data: cards
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single card
// @route   GET /api/cards/:id
// @access  Public
export const getCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.id);
    
    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: card
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get card recommendations for user
// @route   GET /api/cards/recommendations
// @access  Private
export const getRecommendations = async (req, res, next) => {
  try {
    // Get user preferences
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Build query based on user preferences
    const query = {};
    
    // Filter by categories if user has preferences
    if (user.preferences.categories && user.preferences.categories.length > 0) {
      query.category = { $in: user.preferences.categories };
    }
    
    // Filter by credit score
    if (user.preferences.creditScoreRange) {
      // Map user's credit score to appropriate card requirements
      const creditScoreMap = {
        'Excellent': ['Excellent'],
        'Good': ['Excellent', 'Good'],
        'Fair': ['Excellent', 'Good', 'Fair'],
        'Poor': ['Fair', 'Poor'],
        'Building': ['Poor', 'Building']
      };
      
      query.creditScoreRequired = { $in: creditScoreMap[user.preferences.creditScoreRange] };
    }
    
    // Filter by annual fee preference
    if (user.preferences.annualFeePreference === 'No Fee') {
      query.annualFee = 0;
    } else if (user.preferences.annualFeePreference === 'Low Fee') {
      query.annualFee = { $lte: 100 };
    }
    
    // Get matching cards
    const cards = await Card.find(query);
    
    // Calculate match score (simplified version)
    const recommendedCards = cards.map(card => {
      let matchScore = 0;
      
      // Category match
      if (user.preferences.categories && user.preferences.categories.includes(card.category)) {
        matchScore += 40;
      }
      
      // Credit score match
      if (user.preferences.creditScoreRange === card.creditScoreRequired) {
        matchScore += 30;
      } else if (
        (user.preferences.creditScoreRange === 'Excellent' && card.creditScoreRequired === 'Good') ||
        (user.preferences.creditScoreRange === 'Good' && card.creditScoreRequired === 'Fair') ||
        (user.preferences.creditScoreRange === 'Fair' && card.creditScoreRequired === 'Poor')
      ) {
        matchScore += 20;
      }
      
      // Annual fee match
      if (
        (user.preferences.annualFeePreference === 'No Fee' && card.annualFee === 0) ||
        (user.preferences.annualFeePreference === 'Low Fee' && card.annualFee <= 100) ||
        (user.preferences.annualFeePreference === 'Any')
      ) {
        matchScore += 30;
      }
      
      // Ensure score is between 0-100
      matchScore = Math.min(100, Math.max(0, matchScore));
      
      return {
        ...card.toObject(),
        matchScore
      };
    });
    
    // Sort by match score
    recommendedCards.sort((a, b) => b.matchScore - a.matchScore);
    
    res.status(200).json({
      success: true,
      count: recommendedCards.length,
      data: recommendedCards
    });
  } catch (error) {
    next(error);
  }
};