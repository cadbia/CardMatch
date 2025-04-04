import { useState, useEffect } from 'react';
import { CreditCard, RefreshCw } from 'lucide-react';
import { fetchDashboardData } from '../services/api';
import { Card } from '../types';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await fetchDashboardData();
      setCards(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load recommendations. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    loadData();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
        <button 
          className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Matches
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Top Card Matches</h2>
            
            {cards.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No card matches found. Update your preferences to get personalized recommendations.
              </p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {cards.map((card) => (
                  <div key={card.id} className="border border-gray-200 rounded-lg p-4 flex">
                    <div className="mr-4 flex-shrink-0">
                      <div className="bg-indigo-100 rounded-lg p-2">
                        <CreditCard className="h-8 w-8 text-indigo-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{card.name}</h3>
                      <p className="text-sm text-gray-500">{card.provider}</p>
                      <div className="mt-2 flex items-center">
                        <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          {card.matchScore}% Match
                        </span>
                        <span className="ml-2 text-xs text-gray-500">{card.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <p className="text-gray-500 text-center py-8">
              Your recent activity will appear here.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;