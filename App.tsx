
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calculator, 
  MessageCircle, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon,
  ShieldAlert,
  Gem
} from 'lucide-react';
import { User, AppState, UserRole } from './types';
import { getAppState, saveAppState, clearAuth, updateUser } from './services/storage';
import { Dashboard } from './components/Dashboard';
import { ProblemSolver } from './components/ProblemSolver';
import { FeedbackForm } from './components/FeedbackForm';
import { AdminPanel } from './components/AdminPanel';
import { PremiumFeatures } from './components/PremiumFeatures'; // Import new component
import { Button } from './components/Button';

// Auth Screen Component
const AuthScreen: React.FC<{ onAuth: (user: User) => void }> = ({ onAuth }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || (isRegistering && (!name || !age))) {
      setError("Sila isi semua ruangan mandatory.");
      return;
    }

    const newUser: User = {
      userId: Math.random().toString(36).substring(7),
      name: isRegistering ? name : email.split('@')[0],
      email: email,
      age: parseInt(age) || 17,
      role: role,
      joinedAt: new Date().toISOString(),
      isPremium: false, // Default to non-premium
    };

    onAuth(newUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl mb-4">
            <Calculator size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">AddMathAI</h1>
          <p className="text-gray-500">Master Additional Mathematics with AI</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
          
          {isRegistering && (
            <>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <input 
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Age</label>
                <input 
                  type="number" value={age} onChange={(e) => setAge(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="17"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <input 
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="name@school.edu.my"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Role</label>
            <select 
              value={role} onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value={UserRole.STUDENT}>Student</option>
              <option value={UserRole.ADMIN}>Admin (Preview)</option>
            </select>
          </div>

          <Button type="submit" className="w-full py-4 text-lg font-bold">
            {isRegistering ? 'Daftar Sekarang' : 'Log Masuk'}
          </Button>
        </form>

        <div className="text-center pt-4">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 font-semibold hover:underline"
          >
            {isRegistering ? 'Dah ada akaun? Log masuk' : 'Baru di sini? Daftar sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(getAppState());
  const [activeTab, setActiveTab] = useState<'dashboard' | 'solve' | 'feedback' | 'admin' | 'premium'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    saveAppState(state);
  }, [state]);

  const handleAuth = (user: User) => {
    setState({ ...state, currentUser: user });
  };

  const handleLogout = () => {
    clearAuth();
    setState({ ...state, currentUser: null });
    setActiveTab('dashboard'); // Reset tab on logout
  };

  const handleUserUpdate = (userId: string, updates: Partial<User>) => {
    updateUser(userId, updates); // Update in storage
    setState(getAppState()); // Refresh state from storage
  };

  const refreshData = () => {
    setState(getAppState());
  };

  if (!state.currentUser) {
    return <AuthScreen onAuth={handleAuth} />;
  }

  const isStudent = state.currentUser.role === UserRole.STUDENT;
  const isAdmin = state.currentUser.role === UserRole.ADMIN;

  const NavItem = ({ id, icon, label, disabled = false }: any) => (
    <button
      onClick={() => {
        if (!disabled) {
          setActiveTab(id);
          setIsSidebarOpen(false);
        }
      }}
      className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
        activeTab === id 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : disabled ? 'opacity-30 cursor-not-allowed text-gray-400' : 'text-gray-500 hover:bg-gray-100 hover:text-blue-600'
      }`}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="p-2 bg-blue-600 text-white rounded-lg">
            <Calculator size={24} />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">AddMathAI</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem id="dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem id="solve" icon={<Calculator size={20} />} label="Solve Problem" />
          <NavItem id="premium" icon={<Gem size={20} />} label="Premium" /> {/* New Premium Nav Item */}
          <NavItem id="feedback" icon={<MessageCircle size={20} />} label="Feedback" />
          {isAdmin && <NavItem id="admin" icon={<ShieldAlert size={20} />} label="Admin Panel" />}
          {!isAdmin && <NavItem id="admin" icon={<ShieldAlert size={20} />} label="Admin Only" disabled />}
        </nav>

        <div className="pt-6 border-t border-gray-100 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold border border-blue-100">
              {state.currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{state.currentUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{state.currentUser.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 w-full p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-semibold"
          >
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </aside>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-black/50 z-50 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white z-50 p-6 flex flex-col transition-transform md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Calculator className="text-blue-600" />
            <span className="text-xl font-bold">AddMathAI</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)}><X /></button>
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem id="dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <NavItem id="solve" icon={<Calculator size={20} />} label="Solve Problem" />
          <NavItem id="premium" icon={<Gem size={20} />} label="Premium" /> {/* New Premium Nav Item */}
          <NavItem id="feedback" icon={<MessageCircle size={20} />} label="Feedback" />
          {isAdmin && <NavItem id="admin" icon={<ShieldAlert size={20} />} label="Admin Panel" />}
        </nav>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-xl font-semibold mt-auto"
        >
          <LogOut size={20} /> Log Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Mobile Only */}
        <header className="md:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2"><Menu /></button>
            <h2 className="font-bold text-gray-900">AddMathAI</h2>
          </div>
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
            {state.currentUser.name.charAt(0)}
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <Dashboard user={state.currentUser} problems={state.problems} onNavigate={setActiveTab} />}
          {activeTab === 'solve' && <ProblemSolver user={state.currentUser} onSuccess={refreshData} />}
          {activeTab === 'premium' && <PremiumFeatures user={state.currentUser} onUserUpdate={handleUserUpdate} onNavigate={setActiveTab} />} {/* Render PremiumFeatures */}
          {activeTab === 'feedback' && <FeedbackForm user={state.currentUser} />}
          {activeTab === 'admin' && isAdmin && <AdminPanel appState={state} />}
          
          {/* Solution Display Section (Always visible if a problem was just solved) */}
          {activeTab === 'solve' && state.problems.length > 0 && (
            <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Latest Solution</h3>
              <div className="prose prose-blue max-w-none">
                <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-xl text-gray-700">
                  {state.problems[0].solution}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Mobile Nav Shortcut */}
        <div className="md:hidden h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 shrink-0">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <LayoutDashboard size={20} />
            <span className="text-[10px] font-bold">Dash</span>
          </button>
          <button 
            onClick={() => setActiveTab('solve')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'solve' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <div className="bg-blue-600 text-white p-2 rounded-full -mt-8 shadow-lg">
              <Calculator size={24} />
            </div>
            <span className="text-[10px] font-bold">Solve</span>
          </button>
          <button 
            onClick={() => setActiveTab('premium')} // Mobile Premium Nav Item
            className={`flex flex-col items-center gap-1 ${activeTab === 'premium' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Gem size={20} />
            <span className="text-[10px] font-bold">Premium</span>
          </button>
          <button 
            onClick={() => setActiveTab('feedback')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'feedback' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <MessageCircle size={20} />
            <span className="text-[10px] font-bold">Feedback</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;
