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


//NEED: User to have the following preferences: Can be an option so they do not have to select these, the first 3 can be default mandatory picks
//apr - exceptional, good, average, no preference
//rewards rate - flate-rate, category specific, no preference
//sign up bonus- preferred, no preference
//


export const getRecommendations = async (req, res, next) => {
  try {

    //Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }


    // Build query based on preferences
    const cards = async (user) => {
      query = {};

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
      return cards;
    }


    // Calculate map of card to score based on compatibility, on a scale of 0-100, 100 being the most compatitable
    const recommendedCards = cards.map(card => {
      //ranked should be filled in the following manner:
        //if deciding to rank, first the first number in ranked must be turned to a 0, or off of 

      //Default ranking, each factor is equally weighted. 
        let exWeight = 3;
        user.extraPreferences.forEach((preference)=>{
          if(preference != -1 && preference!= 'signBonus'){
            exWeight++;
          }else if(preference === 'signBonus'){
            if(preference === true) exWeight++;
          }
        })
        let weight = 1/exWeight;
        let ptsArr = [];
        
        switch (exWeight) {//4 means additionally sign, 5 is sign plus apr, 6 is sign plus par plus reward
          case 6:
            if(user.extraPreferences.rewardRate === card.rewardsRate){
              ptsArr.push(1);
            }else{
              ptsArr.push(0);
            }
          case 5:
            if(user.extraPreferences.avgAPR <= card.apr.max && user.extraPreferences.avgAPR >= card.apr.min){
              ptsArr.push(1);
            }else{
              ptsArr.push(0);
            }
          case 4:
            if(user.extraPreferences.signBonus === card.signUpBonus){
              ptsArr.push(1);
            }else{
              ptsArr.push(0);
            }
          case 3:
            let favoredCat = user.preferences.categories.length;
            let enjoyed = 0;
            user.preferences.categories.forEach((cardCategory) => {
              if (card.categories.includes(cardCategory)) {
                enjoyed += 1;
              }
            })
            if (enjoyed === 0) ptsArr.push(0);
            else ptsArr.push(favoredCat / enjoyed);

            if (
              (user.preferences.annualFeePreference === 'Any') ||
              (user.preferences.annualFeePreference === 'No Fee' && card.annualFee === 0) ||
              (user.preferences.annualFeePreference === 'Low Fee' && card.annualFee <= 50)
            ) {
              ptsArr.push(1);
            } else if
              (user.preferences.annualFeePreference === 'Low Fee' && card.annualFee <= 150) {
              ptsArr.push(.5);
            } else {
              ptsArr.push(0);
            }

            if (user.preferences.creditScoreRange === card.creditScoreRequired) {
              ptsArr.push(1);
            } else if ((user.preferences.creditScoreRange === 'Excellent' && card.creditScoreRequired === 'Good') ||
              (user.preferences.creditScoreRange === 'Good' && (card.creditScoreRequired === 'Fair' || card.creditScoreRequired === 'Excellent')) ||
              (user.preferences.creditScoreRange === 'Fair' && (card.creditScoreRequired === 'Poor' || card.creditScoreRequired === 'Good')) ||
              (user.preferences.creditScoreRange === 'Poor' && (card.creditScoreRequired === 'Fair' || card.creditScoreRequired === 'Building'))) {
              ptsArr.push(.5);
            } else {
              ptsArr.push(0);
            }
        }
        let SCORE = 0;
        ptsArr.forEach((num) => {
          SCORE += weight * num;
        })
        return {
          ...card.tooObject(),
          SCORE
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