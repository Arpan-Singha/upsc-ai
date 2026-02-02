import { Flame, Target, BookOpen, Trophy, ArrowRight, Clock } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function Home() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        mcqs_practiced: 0,
        accuracy: 0,
        mains_answers: 0,
        streak: 0,
        rank: '--',
        today_mcqs: 0
    });

    useEffect(() => {
        // Fetch stats (Guest or Real)
        const fetchStats = async () => {
            const userId = user ? user.id : 'guest';
            const data = await api.getUserStats(userId);
            if (data) setStats(data);
        };
        fetchStats();
    }, [user]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, Aspirant</h1>
                    <p className="text-gray-500 mt-1">Ready to crush your goals today?</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm flex items-center gap-2 text-sm font-medium text-orange-600">
                        <Flame size={18} fill="currentColor" />
                        <span>{stats.streak} Day Streak</span>
                    </div>
                </div>
            </header>

            {/* Today's Activity Section */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Today's Activity</h2>
                    <button onClick={() => navigate('/progress')} className="text-sm text-blue-600 font-medium hover:underline">View Progress</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ActivityCard
                        title="MCQs Practiced"
                        value={stats.today_mcqs}
                        target="/ 50"
                        icon={<Target className="text-blue-500" />}
                        color="bg-blue-500"
                        progress={(stats.today_mcqs / 50) * 100}
                    />
                    <ActivityCard
                        title="Accuracy"
                        value={`${stats.accuracy}%`}
                        target="Avg. 72%"
                        icon={<Target className="text-green-500" />}
                        color="bg-green-500"
                        progress={stats.accuracy}
                    />
                    <ActivityCard
                        title="Mains Answers"
                        value={stats.mains_answers}
                        target="/ 2"
                        icon={<BookOpen className="text-purple-500" />}
                        color="bg-purple-500"
                        progress={(stats.mains_answers / 2) * 100}
                    />

                    {/* Time Studied - Now fetching from backend (Daily Reset) */}
                    <ActivityCard
                        title="Time Studied"
                        value={`${stats.today_hours || 0}h`}
                        target="/ 6h"
                        icon={<Clock className="text-orange-500" />}
                        color="bg-orange-500"
                        progress={((stats.today_hours || 0) / 6) * 100}
                    />
                </div>
            </section>

            {/* Quick Access / PYQs */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Practice PYQs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <QuickLinkCard
                        title="Prelims GS PYQs"
                        description="2011 - 2025"
                        icon={<Target className="text-white" />}
                        gradient="from-blue-500 to-cyan-500"
                        onClick={() => navigate('/practice/pyqs')}
                    />
                    <QuickLinkCard
                        title="Mains Model Answers"
                        description="2013 - 2024"
                        icon={<BookOpen className="text-white" />}
                        gradient="from-purple-500 to-pink-500"
                        onClick={() => navigate('/practice/mains')}
                    />
                </div>
            </section>

            {/* Streak & Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Weekly Streak</h3>
                        <Flame className="text-orange-500" />
                    </div>
                    <div className="flex justify-between items-center text-center">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
                            const isToday = i === new Date().getDay() - 1; // 0=Mon, 6=Sun approx logic
                            return (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${isToday && stats.streak > 0 ? 'bg-orange-100 text-orange-600 font-bold' : 'bg-gray-100 text-gray-400'}`}>
                                        {day}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-6">Consistency is key to cracking UPSC.</p>
                </Card>

                <Card className="flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Leaderboard</h3>
                        <Trophy className="text-yellow-500" />
                    </div>
                    <div className="text-center py-4">
                        <span className="text-4xl font-bold text-gray-900"># {stats.rank}</span>
                        <p className="text-gray-500 text-sm mt-1">Global CMS Rank</p>
                    </div>
                    <button
                        onClick={() => navigate('/practice/tests')}
                        className="w-full py-2 bg-gray-50 text-gray-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        View Leaderboard
                    </button>
                </Card>
            </div>
        </div>
    );
}

function ActivityCard({ title, value, target, icon, progress, color }) {
    return (
        <Card className="p-5 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium text-slate-500">{title}</span>
                    <div className="p-1.5 bg-slate-50 rounded-md">{icon}</div>
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                    <span className="text-2xl font-bold text-slate-900">{value}</span>
                    <span className="text-xs text-slate-400 font-medium">{target}</span>
                </div>
            </div>
            <ProgressBar value={progress} colorClass={color} className="h-1.5" />
        </Card>
    )
}

function QuickLinkCard({ title, description, icon, gradient, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`p-6 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg cursor-pointer transform transition-all hover:scale-[1.01] active:scale-[0.99]`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold mb-1">{title}</h3>
                    <p className="text-white/80 text-sm font-medium">{description}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    {icon}
                </div>
            </div>
            <div className="mt-8 flex items-center gap-2 text-sm font-medium">
                <span>Start Practicing</span>
                <ArrowRight size={16} />
            </div>
        </div>
    )
}
