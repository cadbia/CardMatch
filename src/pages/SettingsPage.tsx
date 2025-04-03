/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PreferenceItem } from '../components/PreferencesList';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
import { updateUserPreferences, deleteAccount, getCurrentUser } from '../services/api';

const SettingsPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Preference state
  const [categories, setCategories] = useState<string[]>([]);
  const [annualFeePreference, setAnnualFeePreference] = useState('');
  const [creditScoreRange, setCreditScoreRange] = useState('');
  const [signBonus, setSignBonus] = useState(false);
  const [avgAPR, setAvgAPR] = useState<number | ''>('');
  const [rewardRate, setRewardRate] = useState('');

  // Preference ranking
  const [allPreferenceItems, setAllPreferenceItems] = useState([
    { id: 'categories', label: 'Card Categories', rank: 3, isAdvanced: false },
    { id: 'annualFeePreference', label: 'Annual Fee', rank: 2, isAdvanced: false },
    { id: 'creditScoreRange', label: 'Credit Score', rank: 1, isAdvanced: false }
  ]);

  // Load user preferences from backend
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const response = await getCurrentUser();
        const userData = response.data;
        
        // Set basic preferences
        setCategories(userData.preferences?.categories || []);
        setAnnualFeePreference(userData.preferences?.annualFeePreference || '');
        setCreditScoreRange(userData.preferences?.creditScoreRange || '');
        
        // Set advanced preferences
        setSignBonus(userData.extraPreferences?.signBonus || false);
        setAvgAPR(userData.extraPreferences?.avgAPR || '');
        setRewardRate(userData.extraPreferences?.rewardRate || '');
        
        // Set preference rankings and update items list
        const updatedItems = [
          { id: 'categories', label: 'Card Categories', rank: userData.rankedPref?.categories || 3, isAdvanced: false },
          { id: 'annualFeePreference', label: 'Annual Fee', rank: userData.rankedPref?.annualFeePreference || 2, isAdvanced: false },
          { id: 'creditScoreRange', label: 'Credit Score', rank: userData.rankedPref?.creditScoreRange || 1, isAdvanced: false }
        ];

        // Add advanced preferences if they exist
        if (userData.extraPreferences?.signBonus) {
          updatedItems.push({ id: 'signBonus', label: 'Sign-up Bonus', rank: userData.rankedPref?.signBonus || 0, isAdvanced: true });
        }
        if (userData.extraPreferences?.avgAPR) {
          updatedItems.push({ id: 'avgAPR', label: 'APR Range', rank: userData.rankedPref?.avgAPR || 0, isAdvanced: true });
        }
        if (userData.extraPreferences?.rewardRate) {
          updatedItems.push({ id: 'rewardRate', label: 'Reward Rate', rank: userData.rankedPref?.rewardRate || 0, isAdvanced: true });
        }

        setAllPreferenceItems(updatedItems);
      } catch (err) {
        console.error('Error loading user preferences:', err);
        setError('Failed to load preferences');
      }
    };

    loadUserPreferences();
  }, []);

  // Effect to update preference items when advanced preferences change
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
        return newItems.map((item, index) => ({
          ...item,
          rank: items.length - index,
        }));
      });
    }
  };

  const handleSavePreferences = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Create rankings object from preference items
      const rankings = Object.fromEntries(
        allPreferenceItems.map(item => [item.id, item.rank])
      );

      const updatedPreferences = {
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

      await updateUserPreferences(updatedPreferences);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsLoading(true);
      await deleteAccount();
      await logout();
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete account');
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

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Card Preferences</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Card Categories
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Fee Preference
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credit Score Range
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
          </div>

          <div>
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
            <div className="space-y-4 border-t border-gray-200 pt-4">
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

          <div className="border-t border-gray-200 pt-6">
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

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSavePreferences}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out disabled:bg-indigo-400"
            >
              {isLoading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-red-600 mb-4">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        
        {showDeleteConfirm ? (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-700 mb-4">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md shadow-sm"
              >
                Yes, Delete My Account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md shadow-sm"
          >
            Delete Account
          </button>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;