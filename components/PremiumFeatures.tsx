
import React, { useState } from 'react';
import { Button } from './Button';
import { Gem, Award, Infinity, Zap, CheckCircle, XCircle } from 'lucide-react';
import { User } from '../types';

interface PremiumFeaturesProps {
  user: User;
  onUserUpdate: (userId: string, updates: Partial<User>) => void;
  onNavigate: (tab: string) => void;
}

export const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({ user, onUserUpdate, onNavigate }) => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const handleUpgrade = async () => {
    setIsProcessingPayment(true);
    setPaymentStatus('idle');
    try {
      // Simulate Billplz bill creation and redirection
      // In a real app, you'd make a POST request to your backend:
      // const response = await fetch('/api/create-billplz-bill', { method: 'POST', body: JSON.stringify({ amount: 2999, userId: user.userId }) });
      // const { billUrl } = await response.json();
      // window.location.href = billUrl; // Redirect to Billplz payment page

      // For this frontend-only simulation:
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      // Simulate successful payment
      onUserUpdate(user.userId, { isPremium: true });
      setPaymentStatus('success');
    } catch (error) {
      console.error('Simulated payment failed:', error);
      setPaymentStatus('failed');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (user.isPremium) {
    return (
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-8 rounded-3xl shadow-xl space-y-6 text-center">
        <div className="p-4 bg-white/20 rounded-full inline-block">
          <Award size={48} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold">You're a Premium Member!</h2>
        <p className="text-lg opacity-90">Thank you for supporting AddMathAI. Enjoy unlimited access to all features!</p>
        <ul className="text-left max-w-md mx-auto space-y-3 mt-6 text-base opacity-90">
          <li className="flex items-center gap-3"><Infinity size={20} className="text-yellow-300" /> Unlimited Problem Solves</li>
          <li className="flex items-center gap-3"><Zap size={20} className="text-yellow-300" /> Priority AI Processing</li>
          <li className="flex items-center gap-3"><CheckCircle size={20} className="text-yellow-300" /> Advanced Performance Analytics (Coming Soon!)</li>
        </ul>
        <Button variant="outline" className="mt-8 text-white border-white hover:bg-white/20" onClick={() => onNavigate('dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Gem className="text-yellow-500" size={24} />
        <h2 className="text-2xl font-bold text-gray-800">Unlock Premium Features</h2>
      </div>
      <p className="text-gray-600 text-lg">
        Upgrade to AddMathAI Premium for an enhanced learning experience!
      </p>

      <ul className="space-y-4 text-gray-700">
        <li className="flex items-center gap-3 text-lg font-medium">
          <Infinity size={24} className="text-blue-600" /> Unlimited Problem Solves
          <span className="text-sm text-gray-500">(Solve as many problems as you need)</span>
        </li>
        <li className="flex items-center gap-3 text-lg font-medium">
          <Zap size={24} className="text-indigo-600" /> Faster AI Processing
          <span className="text-sm text-gray-500">(Get solutions even quicker)</span>
        </li>
        <li className="flex items-center gap-3 text-lg font-medium">
          <Award size={24} className="text-green-600" /> Exclusive Content & Analytics
          <span className="text-sm text-gray-500">(Access special study materials and track detailed progress)</span>
        </li>
      </ul>

      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-gray-500 text-sm font-medium mb-1">Annual Subscription</p>
          <p className="text-3xl font-bold text-gray-900">RM 29.99<span className="text-base font-normal text-gray-500">/year</span></p>
          <p className="text-xs text-gray-400 mt-1">Cancel anytime.</p>
        </div>
        <Button 
          variant="primary" 
          size="lg" 
          isLoading={isProcessingPayment}
          onClick={handleUpgrade}
          className="w-full md:w-auto px-8 py-3"
        >
          {isProcessingPayment ? 'Processing...' : 'Upgrade to Premium'}
        </Button>
      </div>

      {paymentStatus === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3 mt-4">
          <CheckCircle size={20} /> Simulated payment successful! User upgraded to Premium.
        </div>
      )}
      {paymentStatus === 'failed' && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-3 mt-4">
          <XCircle size={20} /> Simulated payment failed. Please try again.
        </div>
      )}

      <div className="text-sm text-gray-500 mt-6 pt-4 border-t border-gray-100">
        <p className="font-bold text-red-600">Important Disclaimer (Simulated Integration):</p>
        <p className="mt-2">This "Upgrade to Premium" feature is a **frontend simulation** to demonstrate the UI flow of a payment gateway integration (like Billplz).</p>
        <p className="mt-1">A **real Billplz integration would require a secure backend server** to handle API keys, create bills, and process webhooks securely. Direct frontend integration with Billplz is not recommended for security reasons.</p>
      </div>
    </div>
  );
};
