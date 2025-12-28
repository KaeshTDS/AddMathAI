
import React from 'react';
// Added FileText to the import list
import { BookOpen, CheckCircle, Clock, TrendingUp, History, FileText } from 'lucide-react';
import { User, MathProblem } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  user: User;
  problems: MathProblem[];
}

export const Dashboard: React.FC<DashboardProps> = ({ user, problems }) => {
  // Simple stats calculation
  const totalSolved = problems.length;
  const recentProblems = problems.slice(0, 5);

  // Chart data calculation (last 7 days)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const count = problems.filter(p => p.submissionTime.startsWith(dateStr)).length;
    return {
      day: new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d),
      solved: count
    };
  });

  return (
    <div className="space-y-6">
      {/* Header with Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Selamat Kembali, {user.name}!</h1>
          <p className="text-gray-500">Track your progress and conquer Additional Mathematics.</p>
        </div>
        <div className="flex gap-2 text-sm text-gray-400 bg-white px-3 py-1.5 rounded-full border border-gray-100 w-fit">
          <Clock size={16} /> Joined {new Date(user.joinedAt).toLocaleDateString()}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<BookOpen className="text-blue-600" />} 
          label="Total Solved" 
          value={totalSolved.toString()} 
          bgColor="bg-blue-50" 
        />
        <StatCard 
          icon={<CheckCircle className="text-green-600" />} 
          label="Syllabus Topics" 
          value={new Set(problems.map(p => p.topic).filter(Boolean)).size.toString()} 
          bgColor="bg-green-50" 
        />
        <StatCard 
          icon={<TrendingUp className="text-indigo-600" />} 
          label="Current Streak" 
          value="0 Days" 
          bgColor="bg-indigo-50" 
        />
        <StatCard 
          icon={<History className="text-orange-600" />} 
          label="Recent Activity" 
          value={totalSolved > 0 ? "Active" : "New User"} 
          bgColor="bg-orange-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Learning Momentum</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Line 
                  type="monotone" 
                  dataKey="solved" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* History / Recent Interactions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Solves</h3>
          <div className="space-y-4">
            {recentProblems.length > 0 ? (
              recentProblems.map(p => (
                <div key={p.problemId} className="flex gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group border border-transparent hover:border-gray-100">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="Math problem" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FileText size={20} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.topic || 'General Math'}</p>
                    <p className="text-xs text-gray-500 truncate">{new Date(p.submissionTime).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400">No problems solved yet.</p>
                <p className="text-xs text-gray-300 mt-1">Start by clicking 'Solve a Problem'</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, bgColor }: { icon: React.ReactNode, label: string, value: string, bgColor: string }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
    <div className={`p-3 rounded-xl ${bgColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);
