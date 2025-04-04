import { Link } from 'react-router-dom';
import { CreditCard, Shield, Zap } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to CardMatch</h1>
        <p className="text-xl text-gray-600 mb-8">
          Find the perfect card for your needs with our smart matching algorithm.
        </p>
        <div className="flex justify-center">
          <Link
            to="/login"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md shadow-sm transition duration-150 ease-in-out"
          >
            Get Started
          </Link>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Why Choose CardMatch?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-center mb-4">
              <CreditCard className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2 text-center">Smart Matching</h3>
            <p className="text-gray-600 text-center">
              Our algorithm finds the perfect card based on your spending habits and preferences.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2 text-center">Secure Process</h3>
            <p className="text-gray-600 text-center">
              Your data is always protected with bank-level security and encryption.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-center mb-4">
              <Zap className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2 text-center">Fast Results</h3>
            <p className="text-gray-600 text-center">
              Get personalized card recommendations in seconds, not hours.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;