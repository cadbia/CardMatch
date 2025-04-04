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
    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Build query based on preferences
    const cards = async (user) => {
      let query = {};

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

    const cardsData = await cards(user);
    // Calculate match score based on preferences and their rankings
    const recommendedCards = cardsData.map(card => {
      //Find valid categories, and map each key to a weight and value
      let amntPref = 3;
      let totalWeight = 0;
      //map each key to a weight and value for that weight(0-1)
      const ValsToWeight = new Map();
      Object.keys(user.preferences).forEach((key)=>{
        let rankedVal = user.rankedPref[key];
        totalWeight += rankedVal;
        ValsToWeight.set(key, [rankedVal])
      })
      Object.keys(user.extraPreferences).forEach((key)=>{
        if(key){
          let rankedVal = user.rankedPref[key];
          totalWeight+= rankedVal;
          ValsToWeight.set(key, [rankedVal])
          amntPref++;
        }
      })

      //pos 0 holds the amnt of ranked
      //update each key with its respective weight, in pos[1] of arr key
      //keys amount of respect on each weight is in pos[0] of arr key
      
      for(const key of ValsToWeight.keys()){
        let WeightPerPts = 1/totalWeight;
        WeightPerPts *= ValsToWeight.get(key)[0];
        ValsToWeight.get(key).push(WeightPerPts);
        //Now pos 1 holds weight. Not replace pos 0 with the correct value
        ValsToWeight.get(key)[0] = ()=>{
          if(key === 'categories'){
            let favoredCat = user.preferences.categories.length;
            let enjoyed = 0;
            user.preferences.categories.forEach((cardCategory) => {
              if (card.category.includes(cardCategory)) {
                enjoyed += 1;
              }
            })
            if (enjoyed === 0) return 0;
            else return(favoredCat / enjoyed);
          }
          if(key === 'annualFeePreference'){
            if (
              (user.preferences.annualFeePreference === 'Any') ||
              (user.preferences.annualFeePreference === 'No Fee' && card.annualFee === 0) ||
              (user.preferences.annualFeePreference === 'Low Fee' && card.annualFee <= 50)
            ) {
              return 1;
            } else if
              (user.preferences.annualFeePreference === 'Low Fee' && card.annualFee <= 150) {
              return .5;
            } else {
              return 0;
            }
          }
          if(key === 'creditScoreRange'){
            if (user.preferences.creditScoreRange === card.creditScoreRequired) {
              return 1;
            } else if ((user.preferences.creditScoreRange === 'Excellent' && card.creditScoreRequired === 'Good') ||
              (user.preferences.creditScoreRange === 'Good' && (card.creditScoreRequired === 'Fair' || card.creditScoreRequired === 'Excellent')) ||
              (user.preferences.creditScoreRange === 'Fair' && (card.creditScoreRequired === 'Poor' || card.creditScoreRequired === 'Good')) ||
              (user.preferences.creditScoreRange === 'Poor' && (card.creditScoreRequired === 'Fair' || card.creditScoreRequired === 'Building'))) {
              return .5;
            } else {
              return 0;
            }
          }

          if(key === 'signBonus'){
            if(user.extraPreferences.signBonus === true && card.signupBonus !== 'None'){
              return 1;
            }else{
              return 0;
            }
          }
          if(key === 'avgAPR'){
            if(user.extraPreferences.avgAPR <= card.apr.max && user.extraPreferences.avgAPR >= card.apr.min){
             return 1;
            }else{
              return 0;
            }
          }
          if(key === 'rewardRate'){
            if(user.extraPreferences.rewardRate === card.rewardsRate){
              return 1;
            }else{
              return 0;
            }
          }
          console.log('err');
          return NaN;
        }
      }
      
      let matchScore = 0;
      ValsToWeight.forEach((arr) => {
        matchScore += (arr[0]() * arr[1]);
      })

      // Convert to percentage and round to nearest integer
      matchScore = Math.round(matchScore * 100);

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