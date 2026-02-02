import { LayoutDashboard, BookOpen, Trophy, Settings, Flame, Target, MessageSquare, FileText, BarChart, HelpCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar() {
    return (
        <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200 hidden md:flex flex-col p-6 h-screen sticky top-0">
            <div className="flex items-center gap-2 mb-10 px-2">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">U</div>
                <span className="text-xl font-bold tracking-tight text-gray-900">upsc.ai</span>
            </div>

            <nav className="space-y-1 flex-1">
                <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Home" />
                <NavItem to="/ask-kalam" icon={<MessageSquare size={20} />} label="Ask StudyIQ AI" />
                <NavItem to="/current-affairs" icon={<BookOpen size={20} />} label="Current Affairs" />
                <NavItem to="/library" icon={<FileText size={20} />} label="My Library" />

                <div className="pt-4 pb-2">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Prelims</p>
                </div>
                <NavItem to="/practice/prelims" icon={<Target size={20} />} label="MCQ Practice" />
                <NavItem to="/tests" icon={<FileText size={20} />} label="My Tests" />

                <div className="pt-4 pb-2">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mains</p>
                </div>
                <NavItem to="/practice/mains" icon={<BookOpen size={20} />} label="Answer Writing" />

                <div className="pt-4 pb-2">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Personal</p>
                </div>
                <NavItem to="/progress" icon={<BarChart size={20} />} label="My Progress" />
            </nav>

            <div className="mt-auto pt-4 border-t border-gray-100">
                <UserProfile />
            </div>
        </aside>
    );
}

function UserProfile() {
    const { user, signOut } = useAuth();

    if (!user) {
        return <NavItem to="/auth" icon={<div className="w-5 h-5 bg-gray-200 rounded-full" />} label="Sign In" />;
    }

    return (
        <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                {user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                <button onClick={signOut} className="text-xs text-red-500 hover:text-red-600 font-medium">
                    Sign Out
                </button>
            </div>
        </div>
    );
}

function NavItem({ icon, label, to }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive
                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/10'
                    : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900'
            )}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </NavLink>
    );
}
