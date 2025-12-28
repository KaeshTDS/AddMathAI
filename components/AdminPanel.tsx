
import React from 'react';
import { Users, BarChart2, MessageCircle, ShieldCheck } from 'lucide-react';
import { AppState } from '../types';

interface AdminPanelProps {
  appState: AppState;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ appState }) => {
  // Mocking some user list as we don't have a real DB of users besides current session
  // In a real app, this would be fetched from backend.
  const stats = [
    { label: 'Total Submissions', value: appState.problems.length, icon: <BarChart2 size={20} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Sessions', value: '1', icon: <Users size={20} />, color: 'bg-green-50 text-green-600' },
    { label: 'Feedbacks Recieved', value: appState.feedbacks.length, icon: <MessageCircle size={20} />, color: 'bg-indigo-50 text-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-lg text-white">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Command Center</h1>
          <p className="text-gray-500">Manage application content and user analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Recent Problems Log</h3>
            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">Live Logs</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-3">User ID</th>
                  <th className="px-6 py-3">Language</th>
                  <th className="px-6 py-3">Time</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appState.problems.length > 0 ? appState.problems.slice(0, 10).map((p) => (
                  <tr key={p.problemId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{p.userId}</td>
                    <td className="px-6 py-4">{p.language}</td>
                    <td className="px-6 py-4 text-gray-400">{new Date(p.submissionTime).toLocaleTimeString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold">Solved</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-400">No submission logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4">Latest Feedback</h3>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {appState.feedbacks.length > 0 ? appState.feedbacks.map((f) => (
              <div key={f.feedbackId} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-gray-900">{f.userName}</span>
                  <span className="text-xs text-gray-400">{new Date(f.submissionTime).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 italic">"{f.feedbackText}"</p>
              </div>
            )) : (
              <div className="text-center py-20 text-gray-400">No feedback submissions yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
