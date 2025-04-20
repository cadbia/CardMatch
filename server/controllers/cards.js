import Card from '../models/Card.js';
import Transaction from '../models/Transaction.js';
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

//@ caden why does this not need a /:id?



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
    const Transactions = await Transaction.find({user: req.user.id});
    //map of possible categories to a card category
    const TransMap = new Map([
      ['Groceries', 'Cash Back'],
      ['Streaming Services', 'Cash Back'],
      ['Ride Sharing', 'Travel'],
      ['Streaming', 'Cash Back'],
      ['Transit', 'Travel'],
      ['Transfers','Low Interest'],
      ['Shopping', 'Cash Back'],
      ['Dining', 'Business'],
      ['GoodWill', 'Building Credit'],
      ['School','Student'],
      ['Car Rental', 'Travel'],
      ['Cash Withdrawal', 'Rewards'],
      ['Charity', 'Low Interest'],
      ['Cloud Storage', 'Low Interest'],
      ['Deposit','Business'],
      ['Dining','Rewards'],
      ['Education','Student'],
      ['Fitness','Rewards'],
      ['Gas','Cach Back'],
      ['Healthcare','Business'],
      ['Hotels','Travel'],
      ['Personal Care','Cash Back'],
      ['Pharmacy','Low Interest'],
      ['Phone & Internet','Low Interest'],
      ['Software', 'Low Interest'],
      ['Travel', 'Travel'],
      ['Utilities', 'Low Interest']
      
      //'Travel', 'Cash Back', 'Business', 'Student', 'Rewards', 'Low Interest', 'Building Credit']
    ]);
    
    //if user has transaction history, map the important transaction history to their respective values
      
    if(Transactions != null){
      var TransactionPoints = new Map();
      let amountTrans = await Transaction.countDocuments({user: req.user.id});
     
      //for each transaction, update the map with points for each noticed category. 
      let totalSpent = 0;
      let creditPurchases = 0;
      
      Transactions.forEach((trans)=>{
        if(TransMap.has(trans.category)){
          //this transactions category is able to be matched to a card category.
          //console.log(TransactionPoints.get(TransMap.get(trans.category)));
          if(!TransactionPoints.get(TransMap.get(trans.category))) {
            TransactionPoints.set(TransMap.get(trans.category), 1);
          }else{
            TransactionPoints.set(TransMap.get(trans.category), TransactionPoints.get(TransMap.get(trans.category))+1);

          }
          
        }
        totalSpent += trans.amount;
        
        if(trans.isCredit == true) {
          creditPurchases++;
        }
        
       
      })
    
      TransactionPoints.set("totalSpent", totalSpent);
      if(creditPurchases !== 0) TransactionPoints.set("creditPurchases", creditPurchases/amountTrans);
    
    }
    //console.log(TransactionPoints);
    
    // Build query based on preferences
    const cards = async (user) => {
      let query = {};
      let cards = [];
      
      // Try with strict criteria first
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
          'Poor': ['Fair', 'Poor', 'Building Credit'],
          'Building': ['Poor', 'Building Credit']
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
      cards = await Card.find(query);
      
      // If fewer than 2 cards, relax criteria progressively
      if (cards.length < 2) {
        // First, try removing annual fee restriction
        delete query.annualFee;
        cards = await Card.find(query);
        
        // If still not enough, relax credit score requirements
        if (cards.length < 2) {
          delete query.creditScoreRequired;
          cards = await Card.find(query);
          
          // If still not enough, relax category requirements
          if (cards.length < 2) {
            delete query.category;
            cards = await Card.find(query);
          }
        }
      }
      
      // Fallback: If we still have no cards, return any 3 cards
      if (cards.length < 2) {
        cards = await Card.find().limit(3);
      }
      
      return cards;
    };

    const cardsData = await cards(user);

    // Calculate match score based on preferences and their rankings
    const recommendedCards = cardsData.map(card => {
      //Find valid categories, and map each key to a weight and value
      let amntPref = 3;
      let totalWeight = 0;
      //map each key to a weight and value for that weight(0-1)
      const ValsToWeight = new Map();
      
      Object.keys(user.preferences).forEach((key)=>{
        let rankedVal = user.rankedPref && user.rankedPref[key] ? user.rankedPref[key] : 1;
        totalWeight += rankedVal;
        ValsToWeight.set(key, [rankedVal])
      })
      
      Object.keys(user.extraPreferences || {}).forEach((key)=>{
        if(key!=null){
          let rankedVal = user.rankedPref && user.rankedPref[key] ? user.rankedPref[key] : 1;
          totalWeight += rankedVal;
          ValsToWeight.set(key, [rankedVal])
          amntPref++;
        }
      })
      
      //add a rank position for top 3 purchase categories
      if(typeof(TransactionPoints)==='undefined'){
        console.log("NO transactions found");
      }else{
        //if credit purchase amount is >75% add a rank position for rewards
        if(TransactionPoints.has('creditPurchases') && TransactionPoints.get('creditPurchases') > .75){
          const categoriesWeight = ValsToWeight.get('categories');
          if (categoriesWeight && categoriesWeight[0]) {
            ValsToWeight.set('categories', [categoriesWeight[0]+1]);
            if (!user.preferences.categories.includes('Rewards')) {
              user.preferences.categories.push('Rewards');
            }
            totalWeight++;
          }
        }

        if (TransactionPoints.has('totalSpent')) {
          TransactionPoints.delete('totalSpent');
        }
        if (TransactionPoints.has('creditPurchases')) {
          TransactionPoints.delete('creditPurchases');
        }
        
        const topPurchases = Array.from(TransactionPoints);
        topPurchases.sort((a,b) => b[1] - a[1]);
        
        for(let i = 0; i < Math.min(2, topPurchases.length); i++){
          const categoriesWeight = ValsToWeight.get('categories');
          if (categoriesWeight && categoriesWeight[0]) {
            ValsToWeight.set('categories', [categoriesWeight[0]+1]);
            if (!user.preferences.categories.includes(topPurchases[i][0])) {
              user.preferences.categories.push(topPurchases[i][0]);
            }
            totalWeight += 1;
          }
        }
      }

      //testing for correct values
      // console.log(totalWeight);
      // console.log(ValsToWeight);

      //pos 0 holds the amnt of ranked
      //update each key with its respective weight, in pos[1] of arr key
      //keys amount of respect on each weight is in pos[0] of arr key
      
      for(const key of ValsToWeight.keys()){
        let WeightPerPts = 1/totalWeight;
        WeightPerPts *= ValsToWeight.get(key)[0];
        //console.log(WeightPerPts, totalWeight);
        ValsToWeight.get(key).push(WeightPerPts);
        //Now pos 1 holds weight. Not replace pos 0 with the correct value
        ValsToWeight.get(key)[0] = ()=>{
          if(key === 'categories'){
            let favoredCat = user.preferences.categories.length;
            //console.log("yo here we are: ", favoredCat);
            let enjoyed = 0;
            user.preferences.categories.forEach((cardCategory) => {
              if (card.category.includes(cardCategory)) {
                enjoyed += 1;
              }
            })
            if (enjoyed === 0) return 0;
            // Higher base score for even partial category matches
            else return Math.min(1, (enjoyed / favoredCat) * 1.5);
          }
          if(key === 'annualFeePreference'){
            // "Any" preference should score perfectly for all cards
            if (user.preferences.annualFeePreference === 'Any') {
              return 1;
            }
            // No Fee preference matches exactly with 0 annual fee cards
            else if (user.preferences.annualFeePreference === 'No Fee' && card.annualFee === 0) {
              return 1;
            } 
            // Low Fee preference
            else if (user.preferences.annualFeePreference === 'Low Fee') {
              if (card.annualFee <= 50) return 1; // Perfect match
              else if (card.annualFee <= 100) return 0.8; // Very good match
              else if (card.annualFee <= 150) return 0.6; // Good match
              else if (card.annualFee <= 250) return 0.4; // Acceptable match
              else return 0.2; // Not ideal but not a complete mismatch
            } else {
              // Even for non-matching preferences, give a small score
              return 0.2;
            }
          }
          if(key === 'creditScoreRange'){
            // Exact match
            if (user.preferences.creditScoreRange === card.creditScoreRequired) {
              return 1;
            } 
            // Close match (1 tier away)
            else if ((user.preferences.creditScoreRange === 'Excellent' && card.creditScoreRequired === 'Good') ||
              (user.preferences.creditScoreRange === 'Good' && (card.creditScoreRequired === 'Fair' || card.creditScoreRequired === 'Excellent')) ||
              (user.preferences.creditScoreRange === 'Fair' && (card.creditScoreRequired === 'Poor' || card.creditScoreRequired === 'Good')) ||
              (user.preferences.creditScoreRange === 'Poor' && (card.creditScoreRequired === 'Fair' || card.creditScoreRequired === 'Building'))) {
              return 0.75;
            } 
            // If user's credit score is higher than required, still a good match
            else if (
              (user.preferences.creditScoreRange === 'Excellent' && ['Fair', 'Poor', 'Building'].includes(card.creditScoreRequired)) ||
              (user.preferences.creditScoreRange === 'Good' && ['Poor', 'Building'].includes(card.creditScoreRequired)) ||
              (user.preferences.creditScoreRange === 'Fair' && card.creditScoreRequired === 'Building')
            ) {
              return 0.9; // User qualifies easily
            } else {
              return 0.2; // Not completely incompatible
            }
          }

          if(key === 'signBonus'){
            if(!user.extraPreferences.signBonus) return 0.5; // Neutral if not specified
            if(user.extraPreferences.signBonus === true) {
              // Tiered scoring based on how good the bonus is
              if(card.signupBonus && card.signupBonus !== 'None') {
                if(card.signupBonus.includes('100,000') || card.signupBonus.includes('$1000')) return 1;
                if(card.signupBonus.includes('75,000') || card.signupBonus.includes('$750')) return 0.9;
                if(card.signupBonus.includes('50,000') || card.signupBonus.includes('$500')) return 0.8;
                if(card.signupBonus.includes('25,000') || card.signupBonus.includes('$250')) return 0.7;
                return 0.6; // Any other bonus
              }
              return 0.3; // Has no bonus but user wants one
            }
            return 0.7; // User doesn't want bonus and card doesn't have one
          }
          
          if(key === 'avgAPR'){
            if(!user.extraPreferences.avgAPR) return 0.5; // Neutral if not specified
            
            // Check if card's APR range overlaps with user's preference
            if(user.extraPreferences.avgAPR <= card.apr.max && user.extraPreferences.avgAPR >= card.apr.min){
              return 1; // Perfect match
            } else {
              // Calculate how close the APR is to user's preference
              const avgCardAPR = (card.apr.min + card.apr.max) / 2;
              const difference = Math.abs(user.extraPreferences.avgAPR - avgCardAPR);
              
              if(difference <= 2) return 0.8; // Very close
              if(difference <= 5) return 0.6; // Somewhat close
              if(difference <= 10) return 0.4; // Not too far
              return 0.2; // Quite different but not a complete mismatch
            }
          }
          
          if(key === 'rewardRate'){
            if(!user.extraPreferences.rewardRate) return 0.5; // Neutral if not specified
            
            if(user.extraPreferences.rewardRate === card.rewardsRate){
              return 1;
            } else {
              // Even with different reward rates, provide some match score
              // This could be enhanced by parsing and comparing actual rate values
              return 0.3;
            }
          }
          console.log('err');
          return NaN;
        }
      }
      
      let matchScore = 0;
      let appliedWeights = 0;
      
      ValsToWeight.forEach((arr, key) => {
        try {
          if (arr && typeof arr[0] === 'function' && arr[1] !== undefined) {
            const funcResult = arr[0]();
            if (funcResult !== undefined && !isNaN(funcResult)) {
              // Apply preference ranking as a multiplier (the more important, the more it influences the score)
              const weight = arr[1];
              matchScore += (funcResult * weight);
              appliedWeights += weight;
            }
          }
        } catch (err) {
          console.error(`Error calculating score for ${key}:`, err);
        }
      });

      // Adjust score by applied weights to prevent low scores when only a few preferences matched
      if (appliedWeights > 0) {
        matchScore = matchScore / appliedWeights;
      }
      
      // Boost the score to make matches feel more relevant
      matchScore = Math.min(1, matchScore * 1.2);
      
      // Convert to percentage, clamp to 100 max, and round to nearest integer
      matchScore = Math.min(100, Math.round(matchScore * 100));
      
      // Ensure a minimum score of 25% for all returned cards to make them feel relevant
      matchScore = Math.max(25, matchScore);

      return {
        ...card.toObject(),
        matchScore
      };
    });

    // Sort by match score
    recommendedCards.sort((a, b) => b.matchScore - a.matchScore);

    // Ensure we return at least 2 cards (should always be true now but adding as a safeguard)
    const finalRecommendations = recommendedCards.length >= 2 ? 
      recommendedCards : 
      [...recommendedCards, ...(await Card.find().limit(2 - recommendedCards.length))];
  
    res.status(200).json({
      success: true,
      count: finalRecommendations.length,
      data: finalRecommendations
    });
  } catch (error) {
    next(error);
  }
};