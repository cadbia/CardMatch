import { useState, useEffect, useRef, useCallback } from 'react';
import { CreditCard, RefreshCw, ArrowUp, ArrowDown, Trash2, AlertCircle } from 'lucide-react';
import { fetchDashboardData, getTransactions, updateTransactionCategory, deleteTransaction } from '../services/api';
import { Card } from '../types';
import TransactionUpload from '../components/TransactionUpload';

interface Transaction {
  _id: string;
  date: string;
  description: string;
  amount: number;
  isCredit: boolean;
  category: string;
}

const CATEGORIES = [
  'Select Category',
  'Car Rental',
  'Cash Withdrawal',
  'Charity',
  'Cloud Storage',
  'Deposit',
  'Dining',
  'Education',
  'Fitness',
  'Gas',
  'Groceries',
  'Healthcare',
  'Hotels',
  'Personal Care',
  'Pharmacy',
  'Phone & Internet',
  'Shopping',
  'Software',
  'Streaming',
  'Transit',
  'Transfers',
  'Travel',
  'Utilities'
];

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

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

  const loadTransactions = async (pageNum: number, append = false) => {
    try {
      setIsLoadingTransactions(true);
      const response = await getTransactions({ page: pageNum, limit: 10 });
      
      // Transform transactions to ensure uncategorized ones show "Select Category"
      const transformedTransactions = response.data.map(transaction => ({
        ...transaction,
        category: transaction.category || 'Select Category'
      }));
      
      if (append) {
        setTransactions(prev => [...prev, ...transformedTransactions]);
      } else {
        setTransactions(transformedTransactions);
      }
      
      setHasMore(response.data.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const lastTransactionRef = useCallback((node: HTMLTableRowElement) => {
    if (isLoadingTransactions) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadTransactions(page + 1, true);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoadingTransactions, hasMore, page]);

  useEffect(() => {
    loadData();
    loadTransactions(1);
  }, []);

  const handleRefresh = () => {
    loadData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleCategoryChange = async (transactionId: string, newCategory: string) => {
    try {
      // Don't update if "Select Category" is chosen
      if (newCategory === 'Select Category') {
        return;
      }
      
      await updateTransactionCategory(transactionId, newCategory);
      loadTransactions(1); // Reload transactions to show updated category
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId);
      loadTransactions(1); // Reload transactions after deletion
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleClearHistory = async () => {
    try {
      // Delete all transactions
      await Promise.all(transactions.map(t => deleteTransaction(t._id)));
      setTransactions([]); // Clear the transactions array
      setHasMore(false); // No more transactions to load
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {showUpload ? 'Hide Upload' : 'Upload Transactions'}
          </button>
          <button 
            className="flex items-center text-sm text-indigo-600 hover:text-indigo-800"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Matches
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {showUpload && (
        <div className="mb-8">
          <TransactionUpload onSuccess={() => loadTransactions(1)} />
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              {transactions.length > 0 && (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear History
                </button>
              )}
            </div>

            {showClearConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
                  <div className="flex items-center mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Clear Transaction History</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to clear all transactions? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearHistory}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}

            {transactions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No transactions found. Upload your transaction history to get started.
              </p>
            ) : (
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction, index) => (
                      <tr
                        key={transaction._id}
                        ref={index === transactions.length - 1 ? lastTransactionRef : null}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center">
                            <span className="truncate max-w-xs">{transaction.description}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <select
                            value={transaction.category}
                            onChange={(e) => handleCategoryChange(transaction._id, e.target.value)}
                            className={`block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                              transaction.category === 'Select Category' ? 'text-gray-400' : 'text-gray-900'
                            }`}
                          >
                            {CATEGORIES.map((category) => (
                              <option 
                                key={category} 
                                value={category}
                                className={category === 'Select Category' ? 'text-gray-400' : 'text-gray-900'}
                              >
                                {category}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {transaction.isCredit ? (
                              <ArrowUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className={transaction.isCredit ? 'text-green-600' : 'text-red-600'}>
                              {formatAmount(transaction.amount)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <button
                            onClick={() => handleDeleteTransaction(transaction._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {isLoadingTransactions && (
                  <div ref={loadingRef} className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;