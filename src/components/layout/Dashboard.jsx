import { LayoutDashboard, BookOpen, Trophy, Settings, Flame, Target, Clock } from 'lucide-react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

export function Dashboard() {
    const [stats, setStats] = useState({ questionsSolved: 0, accuracy: 0, testsTaken: 0 });

    useEffect(() => {
        async function loadStats() {
            try {
                const data = await api.getPracticeStats();
                if (data) setStats(data);
            } catch (e) {
                console.error("Failed to load stats", e);
            }
        }
        loadStats();
    }, []);

    return (
        <div className="flex h-screen bg-gray-50/50">
            {/* Sidebar (Unchanged) */}
            <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200 hidden md:flex flex-col p-6">
                <div className="flex items-center gap-2 mb-10">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">U</div>
                    <span className="text-xl font-bold tracking-tight text-gray-900">upsc.ai</span>
                </div>

                <nav className="space-y-1">
                    <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active />
                    <NavItem icon={<BookOpen size={20} />} label="Study Plan" />
                    <NavItem icon={<Target size={20} />} label="Practice" />
                    <NavItem icon={<Trophy size={20} />} label="Achievements" />
                </nav>

                <div className="mt-auto">
                    <NavItem icon={<Settings size={20} />} label="Settings" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, Aspirant</h1>
                        <p className="text-gray-500 mt-1">Here is your real-time progress.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200 shadow-sm flex items-center gap-2 text-sm font-medium">
                            <Flame className="text-orange-500" size={18} fill="currentColor" />
                            <span>1 Day Streak</span>
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Tests Taken"
                        value={stats.testsTaken}
                        subtitle="Keep practicing!"
                        icon={<Clock className="text-blue-500" />}
                        progress={Math.min(stats.testsTaken * 10, 100)}
                        color="bg-blue-500"
                    />
                    <StatsCard
                        title="MCQs Practiced"
                        value={stats.questionsSolved}
                        subtitle="Total attempted"
                        icon={<Target className="text-green-500" />}
                        progress={Math.min((stats.questionsSolved / 100) * 100, 100)}
                        color="bg-green-500"
                    />
                    <StatsCard
                        title="Accuracy"
                        value={`${stats.accuracy}%`}
                        subtitle="Based on tests"
                        icon={<Trophy className="text-purple-500" />}
                        progress={stats.accuracy}
                        color="bg-purple-500"
                    />
                </div>

                {/* Big Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="min-h-[300px]">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance</h3>
                        <div className="space-y-4">
                            <SubjectProgress subject="History" value={78} color="bg-orange-500" />
                            <SubjectProgress subject="Polity" value={65} color="bg-blue-500" />
                            <SubjectProgress subject="Geography" value={45} color="bg-green-500" />
                            <SubjectProgress subject="Economics" value={82} color="bg-purple-500" />
                        </div>
                    </Card>

                    <Card className="min-h-[300px] flex flex-col justify-center items-center text-center">
                        <div className="w-32 h-32 rounded-full border-8 border-gray-100 flex items-center justify-center relative mb-4">
                            <div className="absolute inset-0 rounded-full border-8 border-blue-500 border-t-transparent animate-spin-slow" style={{ animationDuration: '10s' }}></div>
                            <span className="text-3xl font-bold">120</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Total Mock Tests</h3>
                        <p className="text-gray-500">You are ahead of schedule.</p>
                    </Card>
                </div>
            </main>
        </div>
    );
}

function NavItem({ icon, label, active }) {
    return (
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}>
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    );
}

function StatsCard({ title, value, subtitle, icon, progress, color }) {
    return (
        <Card>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
            </div>
            <ProgressBar value={progress} colorClass={color} className="mb-2" />
            <p className="text-xs text-gray-400">{subtitle}</p>
        </Card>
    )
}

function SubjectProgress({ subject, value, color }) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{subject}</span>
                <span className="text-gray-500">{value}%</span>
            </div>
            <ProgressBar value={value} colorClass={color} />
        </div>
    )
}
