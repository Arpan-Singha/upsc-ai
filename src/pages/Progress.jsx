import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts';
import { Trophy, Target, Clock, Zap, Flame, Award, ChevronUp, BookOpen, Swords } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import DailyProgressCalendar from '../components/DailyProgressCalendar'; // New Component

export default function Progress() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('Week'); // Week, Month, Year

    const { user } = useAuth(); // Get user from context

    useEffect(() => {
        const fetchStats = async () => {
            const userId = user ? user.id : 'guest';
            const data = await api.getUserStats(userId);
            setStats(data);

            // Fetch Story
            try {
                const storyRes = await api.generateStory({
                    level: Math.floor(((data.mcqs_practiced * 10) + (data.streak * 50)) / 1000) + 1,
                    streak: data.streak,
                    mcqs: data.mcqs_practiced
                });
                if (storyRes?.story) {
                    setStats(prev => ({ ...prev, story: storyRes.story }));
                }
            } catch (e) {
                console.error("Story fetch failed", e);
            }

            setLoading(false);
        };
        fetchStats();
    }, [user]); // Re-run when user changes

    if (loading) return <div className="p-10 text-center">Loading Progress...</div>;

    // Filter Graph Data based on Time Range
    const getFilteredGraphData = () => {
        const days = timeRange === 'Week' ? 7 : timeRange === 'Month' ? 30 : 365;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - (days - 1));

        // 1. Generate full range of dates
        const dateRange = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dateRange.push(new Date(d).toISOString().split('T')[0]);
        }

        // 2. Map existing history to a dictionary for fast lookup
        const historyMap = {};
        if (stats?.study_history) {
            stats.study_history.forEach(item => {
                historyMap[item.date] = item;
            });
        }

        // 3. Merge: Fill missing days with zero-data
        return dateRange.map(dateStr => {
            const hasData = historyMap[dateStr];
            const dateObj = new Date(dateStr);
            const displayDate = timeRange === 'Week'
                ? dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return {
                date: displayDate, // X-Axis Label
                fullDate: dateStr, // Tooltip keys
                mcqs: hasData ? hasData.mcqs : 0,
                hours: hasData ? hasData.hours : 0
            };
        });
    };

    const graphData = getFilteredGraphData();

    // XP Logic: Rewarding Accuracy (User Request)
    // Formula: (Total Score * 10) + (Streak * 50)
    // Note: Total Score is 2pts per correct answer. So 1 Correct Answer = 20 XP.
    // Wrong Answer = 0 XP.
    const xp = ((stats.total_score || 0) * 10) + (stats.streak * 50);
    const level = Math.floor(xp / 1000) + 1;
    const nextLevelXp = level * 1000;
    const currentLevelXp = xp % 1000;
    const xpProgress = (currentLevelXp / 1000) * 100;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
                    <p className="text-gray-500">Track your journey to becoming an officer.</p>
                </div>
                <div className="flex gap-2">
                    {['Week', 'Month', 'Year'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeRange(t)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${timeRange === t ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </header>

            {/* Hero Level Card - Glassmorphism */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white shadow-xl">
                <div className="absolute top-0 right-0 p-32 bg-white/10 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="w-full">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-bold border border-white/30">
                                {level}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Aspiring Officer</h2>
                                <p className="text-white/80 text-sm">Level {level} • Top 5% Global</p>
                            </div>
                        </div>

                        {/* XP Bar */}
                        <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-wider text-white/70">
                            <span>{currentLevelXp} XP</span>
                            <span>{nextLevelXp} XP</span>
                        </div>
                        <div className="h-4 bg-black/20 rounded-full overflow-hidden border border-white/10 backdrop-blur-sm">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(251,191,36,0.5)]"
                                style={{ width: `${xpProgress}%` }}
                            />
                        </div>
                        <p className="mt-2 text-xs text-white/60">
                            +20 XP per Correct Answer • +50 XP Daily Streak
                        </p>
                    </div>

                    {/* Stats Pill */}
                    <div className="flex gap-4">
                        <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                            <div className="text-2xl font-bold">{stats.streak}</div>
                            <div className="text-xs text-white/70 font-medium">Day Streak</div>
                        </div>
                        <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center">
                            <div className="text-2xl font-bold">{stats.mcqs_practiced}</div>
                            <div className="text-xs text-white/70 font-medium">Total MCQs</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <KPICard
                    title="Time Studied (Today)"
                    value={`${stats.today_hours || 0}h`}
                    trend="+12%"
                    icon={<Clock className="text-blue-600" size={20} />}
                    color="bg-blue-50 text-blue-600"
                />
                <KPICard
                    title="MCQs Solved"
                    value={stats.mcqs_practiced}
                    trend="+8%"
                    icon={<Target className="text-purple-600" size={20} />}
                    color="bg-purple-50 text-purple-600"
                />
                <KPICard
                    title="Accuracy"
                    value={`${stats.accuracy}%`}
                    trend="+2%"
                    icon={<Zap className="text-orange-600" size={20} />}
                    color="bg-orange-50 text-orange-600"
                />
                <KPICard
                    title="Tests Taken"
                    value={Math.round(stats.mcqs_practiced / 20)}
                    trend="0%"
                    icon={<Award className="text-green-600" size={20} />}
                    color="bg-green-50 text-green-600"
                />
            </div>

            {/* Study History & Record Breaker */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-20 bg-orange-50 rounded-full blur-3xl opacity-50 translate-x-10 -translate-y-10"></div>

                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-2/3">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Study Power History</h3>
                                <p className="text-sm text-gray-500">Your daily hours over time</p>
                            </div>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.study_history || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f3f4f6' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <ReferenceLine y={stats.all_time_high || 0} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Record', position: 'right', fill: '#f97316', fontSize: 12 }} />
                                    <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="w-full md:w-1/3 flex flex-col justify-center border-l border-gray-100 pl-8">
                        <div className="bg-orange-50 rounded-2xl p-6 text-center border border-orange-100">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 text-orange-600">
                                <Zap size={24} fill="currentColor" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">Beat Your Record!</h4>
                            <p className="text-sm text-gray-600 mb-4">
                                Your all-time best is <span className="font-bold text-gray-900">{stats.all_time_high || 0} hours</span>.
                            </p>

                            {stats.all_time_high > (stats.today_hours || 0) ? (
                                <div>
                                    <div className="text-3xl font-black text-orange-600 mb-1">
                                        +{(stats.all_time_high - (stats.today_hours || 0)).toFixed(1)}h
                                    </div>
                                    <p className="text-xs text-orange-700 font-medium uppercase tracking-wide">
                                        More power needed
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <div className="text-3xl font-black text-green-600 mb-1">
                                        NEW RECORD!
                                    </div>
                                    <p className="text-xs text-green-700 font-medium uppercase tracking-wide">
                                        You are unstoppable!
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts & Goals Script */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Chart */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Activity Trend</h3>
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full font-medium">
                            <ChevronUp size={16} />
                            <span>15% more than last week</span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={graphData.length > 0 ? graphData : stats.activity_graph}>
                                <defs>
                                    <linearGradient id="colorMcq" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#ddd', strokeDasharray: '4 4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="mcqs"
                                    stroke="#8b5cf6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorMcq)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Daily Progress Calendar */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-6">
                        <DailyProgressCalendar history={stats.study_history || []} />
                    </div>
                </div>

                {/* Goals / Streak */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Goals</h3>
                        <div className="space-y-4">
                            <GoalRow icon={<Target size={18} />} title="Solve 50 MCQs" current={stats.today_mcqs} target={50} color="text-purple-600" bg="bg-purple-600" />
                            <GoalRow icon={<Clock size={18} />} title="Study 6 Hours" current={Math.min(stats.today_hours || 0, 6)} target={6} color="text-blue-600" bg="bg-blue-600" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Flame fill="currentColor" />
                                <span className="font-bold uppercase tracking-wider text-sm opacity-90">Current Streak</span>
                            </div>
                            <div className="text-5xl font-black mb-1">{stats.streak} Days</div>
                            <p className="text-white/80 text-sm mb-4">You're on fire! Keep it up for 3 more days to hit a weekly milestone.</p>

                            {/* Weekly Calendar Bubbles */}
                            <div className="flex justify-between items-center bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                    <div key={i} className={`flex flex-col items-center gap-1`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                            // Mock active days based on graph data or streak for demo
                                            stats.activity_graph && stats.activity_graph[i]?.mcqs > 0
                                                ? 'bg-white text-orange-600'
                                                : 'bg-white/30 text-white/50'
                                            }`}>
                                            {stats.activity_graph && stats.activity_graph[i]?.mcqs > 0 ? '✓' : ''}
                                        </div>
                                        <span className="text-[10px] font-medium opacity-80">{day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Flame size={120} className="absolute -bottom-4 -right-4 text-white/10" />
                    </div>

                    {/* Achievements List */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Achievements</h3>
                            <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">3 Unlocked</span>
                        </div>
                        <div className="space-y-4">
                            <AchievementRow
                                title="First Steps"
                                desc="Complete your first 10 MCQs"
                                icon={<Trophy size={18} />}
                                unlocked={stats.mcqs_practiced >= 10}
                            />
                            <AchievementRow
                                title="Scholar"
                                desc="Study for 10+ hours total"
                                icon={<BookOpen size={18} />}
                                unlocked={(stats.study_hours || 0) >= 10}
                            />
                            <AchievementRow
                                title="Century Club"
                                desc="Solve 100 MCQs correctly"
                                icon={<Target size={18} />}
                                unlocked={stats.mcqs_practiced >= 100}
                            />
                            <AchievementRow
                                title="Unstoppable"
                                desc="Reach a 7-day streak"
                                icon={<Flame size={18} />}
                                unlocked={stats.streak >= 7}
                            />
                            <AchievementRow
                                title="Warrior"
                                desc="Study 8+ hours in a day"
                                icon={<Swords size={18} />}
                                unlocked={stats.achievements?.warrior}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Historical Chronicles Section */}
            <div className="bg-[#fdf6e3] rounded-3xl p-8 border border-[#eaddcf] relative overflow-hidden shadow-lg animate-in fade-in duration-700 mt-8">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4a373] to-transparent opacity-50"></div>

                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-1/3 relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#d4a373] to-[#ccd5ae] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <img
                            src={
                                level >= 6 ? "/images/master.png?v=1" :
                                    level >= 3 ? "/images/scholar.png?v=1" :
                                        "/images/novice.png?v=1"
                            }
                            alt="Ancient Scholar"
                            className="relative rounded-xl shadow-xl w-full object-cover aspect-[4/3] border-4 border-[#fff1e0]"
                        />
                    </div>

                    <div className="w-full md:w-2/3 space-y-4">
                        <div className="flex items-center gap-3">
                            <BookOpen className="text-[#a98467]" size={24} />
                            <h2 className="text-2xl font-serif font-bold text-[#5e503f]">The Chronicles of the Aspirant</h2>
                        </div>

                        <div className="prose prose-stone">
                            <p className="text-lg text-[#5e503f] italic font-serif leading-relaxed">
                                {stats.story || "The scrolls are unfolding your destiny..."}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 mt-4 text-[#8a7e72] text-sm">
                            <div className="h-px bg-[#d4a373] flex-1"></div>
                            <span>Chapter: {new Date().getFullYear()}</span>
                            <div className="h-px bg-[#d4a373] flex-1"></div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

function AchievementRow({ title, desc, icon, unlocked }) {
    return (
        <div className={`flex items-start gap-3 p-3 rounded-xl transition-all ${unlocked ? 'bg-indigo-50 border border-indigo-100' : 'bg-gray-50 border border-gray-100 opacity-60 grayscale'}`}>
            <div className={`p-2 rounded-lg ${unlocked ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {icon}
            </div>
            <div>
                <h4 className={`font-bold text-sm ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>{title}</h4>
                <p className="text-xs text-gray-500">{desc}</p>
            </div>
        </div>
    );
}

function KPICard({ title, value, trend, icon, color }) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-500 text-sm font-medium">{title}</span>
                <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
            </div>
            <div className="flex items-end justify-between">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                {trend && (
                    <div className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                        {trend}
                    </div>
                )}
            </div>
        </div>
    );
}

function GoalRow({ icon, title, current, target, color, bg }) {
    const progress = Math.min((current / target) * 100, 100);
    return (
        <div>
            <div className="flex justify-between text-sm font-medium mb-1">
                <div className="flex items-center gap-2 text-gray-700">
                    <span className={color}>{icon}</span>
                    {title}
                </div>
                <span className="text-gray-500">{current} / {target}</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${bg} rounded-full transition-all duration-500`} style={{ width: `${progress}%` }} />
            </div>
        </div>
    );
}
