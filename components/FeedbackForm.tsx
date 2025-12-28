
import React, { useState } from 'react';
import { MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { addFeedback } from '../services/storage';
import { User, Feedback } from '../types';

interface FeedbackFormProps {
  user: User;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({ user }) => {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newFeedback: Feedback = {
        feedbackId: Date.now().toString(),
        userId: user.userId,
        userName: user.name,
        feedbackText: feedback,
        submissionTime: new Date().toISOString(),
      };
      
      addFeedback(newFeedback);
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFeedback('');
    }, 800);
  };

  if (isSubmitted) {
    return (
      <div className="bg-green-50 border border-green-100 p-6 rounded-2xl flex flex-col items-center text-center space-y-3">
        <div className="p-3 bg-white rounded-full text-green-600 shadow-sm">
          <CheckCircle size={32} />
        </div>
        <h3 className="text-lg font-bold text-green-900">Feedback Submitted</h3>
        <p className="text-green-700 max-w-xs">Terima kasih! Your feedback helps us improve AddMathAI for everyone.</p>
        <Button variant="outline" className="mt-2" onClick={() => setIsSubmitted(false)}>Send another</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="text-blue-600" size={20} />
        <h3 className="text-lg font-bold text-gray-800">Share Feedback</h3>
      </div>
      <p className="text-sm text-gray-500">Found a bug? Have a suggestion? Let us know!</p>
      <textarea
        required
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-gray-700"
        placeholder="Type your message here..."
      ></textarea>
      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Submit Feedback
      </Button>
    </form>
  );
};
