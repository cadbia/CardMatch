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
        if(key!=null){
          let rankedVal = user.rankedPref[key];
          totalWeight+= rankedVal;
          ValsToWeight.set(key, [rankedVal])
          amntPref++;
        }
        
      })
      //add a rank position for top 3 purchase categories
      if(typeof(TransactionPoints)==='undefined'){
        console.log("NO transactions found");
      }else{
       //if credit purchase amount is >75% add a rank position for rewards

      //idk what to with the spending amount i calculated tbh
        if(TransactionPoints.creditPurchases > .75){
          //check if in 

          ValsToWeight.set('categories', [ValsToWeight.get('categories')[0]+1])
          user.preferences.categories.push('Rewards');
          totalWeight++;
        }

        TransactionPoints.delete('totalSpent');
        TransactionPoints.delete('creditPurchases');
        const topPurchases = Array.from(TransactionPoints);
        topPurchases.sort((a,b)=>{b-a});
        for(let i = 0; i< 2; i++){
          //validate if in the map first!
          
            ValsToWeight.set('categories', [ValsToWeight.get('categories')[0]+1]);
            //if user.categores doesnt include this then add
            
            user.preferences.categories.push(topPurchases[i][0]);
            totalWeight+=1;
            if(topPurchases.length ==1) break;
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
            else return(enjoyed / favoredCat);
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
        //console.log(arr[0](), arr[1]);
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