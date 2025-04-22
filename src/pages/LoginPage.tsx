import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login, register } from '../services/api';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { PreferenceItem } from '../components/PreferencesList';
import { ChevronDown, ChevronUp } from 'lucide-react';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Preferences state
  const [categories, setCategories] = useState<string[]>([]);
  const [annualFeePreference, setAnnualFeePreference] = useState('');
  const [creditScoreRange, setCreditScoreRange] = useState('');
  const [signBonus, setSignBonus] = useState(false);
  const [avgAPR, setAvgAPR] = useState<number | ''>('');
  const [rewardRate, setRewardRate] = useState('');
  
  // Combined preference items for drag and drop
  const [allPreferenceItems, setAllPreferenceItems] = useState([
    { id: 'categories', label: 'Card Categories', rank: 3, isAdvanced: false },
    { id: 'annualFeePreference', label: 'Annual Fee', rank: 2, isAdvanced: false },
    { id: 'creditScoreRange', label: 'Credit Score', rank: 1, isAdvanced: false },
  ]);

  // Effect to update preference items when advanced preferences are set
  useEffect(() => {
    const updatedItems = [...allPreferenceItems.filter(item => !item.isAdvanced)];
    
    if (signBonus) {
      updatedItems.push({ id: 'signBonus', label: 'Sign-up Bonus', rank: 0, isAdvanced: true });
    }
    if (avgAPR !== '') {
      updatedItems.push({ id: 'avgAPR', label: 'APR Range', rank: 0, isAdvanced: true });
    }
    if (rewardRate) {
      updatedItems.push({ id: 'rewardRate', label: 'Reward Rate', rank: 0, isAdvanced: true });
    }

    // Preserve existing ranks for items that were already present
    const existingRanks = new Map(allPreferenceItems.map(item => [item.id, item.rank]));
    
    setAllPreferenceItems(updatedItems.map(item => ({
      ...item,
      rank: existingRanks.get(item.id) || 0
    })));
  }, [signBonus, avgAPR, rewardRate, allPreferenceItems]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = allPreferenceItems.findIndex((item) => item.id === active.id);
      const newIndex = allPreferenceItems.findIndex((item) => item.id === over.id);
      
      setAllPreferenceItems((items) => {
        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update ranks based on new positions
        return newItems.map((item, index) => ({
          ...item,
          rank: items.length - index,
        }));
      });
    }
  };

  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const validatePreferences = () => {
    const errors: string[] = [];
    
    if (categories.length === 0) {
      errors.push('Please select at least one card category');
    }
    if (!annualFeePreference) {
      errors.push('Please select your annual fee preference');
    }
    if (!creditScoreRange) {
      errors.push('Please select your credit score range');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && step === 1) {
      setStep(2);
      return;
    }

    if (!isLogin && step === 2) {
      if (!validatePreferences()) {
        return;
      }
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      let response;
      
      if (isLogin) {
        response = await login(email, password);
      } else {
        if (!name) {
          setError('Name is required');
          setIsLoading(false);
          return;
        }
        
        // Create rankings object from preference items
        const rankings = Object.fromEntries(
          allPreferenceItems.map(item => [item.id, item.rank])
        );

        const userData = {
          name,
          email,
          password,
          preferences: {
            categories,
            annualFeePreference,
            creditScoreRange
          },
          extraPreferences: {
            signBonus,
            avgAPR: avgAPR || null,
            rewardRate: rewardRate || null
          },
          rankedPref: rankings
        };
        
        response = await register(userData);
      }
      
      auth.login(response.token, response.user);
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.response?.data?.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = [
    'Travel',
    'Cash Back',
    'Business',
    'Student',
    'Rewards',
    'Low Interest',
    'Building Credit'
  ];

  const renderSignupStep1 = () => (
    <>
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="John Doe"
          disabled={isLoading}
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="you@example.com"
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="••••••••"
          required
          disabled={isLoading}
        />
      </div>
    </>
  );

  const renderPreferenceRanking = () => (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-2">Rank Your Preferences</h3>
      <p className="text-xs text-gray-500 mb-3">Drag to reorder preferences by importance (top = highest priority)</p>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={allPreferenceItems.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {allPreferenceItems.map((item) => (
              <PreferenceItem 
                key={item.id} 
                id={item.id} 
                label={item.label} 
                isAdvanced={item.isAdvanced}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );

  const renderSignupStep2 = () => (
    <>
      {validationErrors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          <ul className="list-disc list-inside text-sm">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Card Categories (Select multiple) *
        </label>
        <div className="grid grid-cols-2 gap-2">
          {categoryOptions.map((category) => (
            <label key={category} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={categories.includes(category)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCategories([...categories, category]);
                  } else {
                    setCategories(categories.filter(c => c !== category));
                  }
                }}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Annual Fee Preference *
        </label>
        <select
          value={annualFeePreference}
          onChange={(e) => setAnnualFeePreference(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select annual fee preference</option>
          <option value="No Fee">No Annual Fee</option>
          <option value="Low Fee">Low Fee ($100 or less)</option>
          <option value="Any">Any Fee</option>
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Credit Score Range *
        </label>
        <select
          value={creditScoreRange}
          onChange={(e) => setCreditScoreRange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select credit score range</option>
          <option value="Excellent">Excellent (720+)</option>
          <option value="Good">Good (690-719)</option>
          <option value="Fair">Fair (630-689)</option>
          <option value="Poor">Poor (580-629)</option>
          <option value="Building">Building (&lt;580)</option>
        </select>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
            {showAdvanced ? 'Hide Advanced Preferences' : 'Show Advanced Preferences'}
          </button>
        </div>

        {showAdvanced && (
          <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Sign-up Bonus Preference
              </label>
              <select
                value={signBonus ? "true" : "false"}
                onChange={(e) => setSignBonus(e.target.value === "true")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="false">Not Important</option>
                <option value="true">Important</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Preferred APR Range
              </label>
              <select
                value={avgAPR}
                onChange={(e) => setAvgAPR(e.target.value ? parseFloat(e.target.value) : '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select APR range</option>
                <option value="10">Under 10%</option>
                <option value="15">10-15%</option>
                <option value="20">15-20%</option>
                <option value="25">20-25%</option>
                <option value="30">Over 25%</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Preferred Reward Rate
              </label>
              <select
                value={rewardRate}
                onChange={(e) => setRewardRate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select reward rate</option>
                <option value="1% on all purchases">1% on all purchases</option>
                <option value="1.5% on all purchases">1.5% on all purchases</option>
                <option value="2% on all purchases">2% on all purchases</option>
                <option value="3% on select categories">3% on select categories</option>
                <option value="5% on rotating categories">5% on rotating categories</option>
                <option value="Points-based rewards">Points-based rewards</option>
                <option value="Travel miles">Travel miles</option>
              </select>
            </div>
          </div>
        )}

      </div>

      {renderPreferenceRanking()}
    </>
  );

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-8">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          {isLogin ? 'Sign in to your account' : `Create a new account ${step === 2 ? '- Preferences' : ''}`}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {isLogin ? (
            <>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </>
          ) : (
            step === 1 ? renderSignupStep1() : renderSignupStep2()
          )}
          
          <div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out disabled:bg-indigo-400"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Signing in...' : step === 1 ? 'Next...' : 'Signing up...'}
                </span>
              ) : (
                <span>{isLogin ? 'Sign in' : step === 1 ? 'Next' : 'Sign up'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-center text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setStep(1);
              setError('');
              setValidationErrors([]);
            }}
            className="ml-1 font-medium text-indigo-600 hover:text-indigo-500"
            disabled={isLoading}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;