import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, Trophy, Target, Zap, Clock, BarChart3, ChevronRight, Lock
} from 'lucide-react';
import { Card } from '../components/ui/Card';

export default function ClassTests() {
    const navigate = useNavigate();

    // Logic: 500 Questions / 10 per Test = 50 Tests
    const totalQuestions = 500;
    const questionsPerTest = 10;
    const totalTests = Math.ceil(totalQuestions / questionsPerTest);

    // Generate 50 Test Objects
    const tests = Array.from({ length: totalTests }, (_, i) => ({
        id: i + 1,
        title: `UPSC Prelims Mock Test ${i + 1}`,
        subject: "Mixed Syllabus",
        totalQuestions: 10,
        duration: "20 min",
        marks: 20,
        status: "live",
        range: `${(i * 10) + 1} - ${(i + 1) * 10}`
    }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Trophy size={120} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-indigo-100 font-medium mb-1">Total Questions</h3>
                        <div className="text-4xl font-bold mb-2">{totalQuestions}</div>
                        <p className="text-indigo-200 text-sm">Access to premium question bank.</p>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h3 className="text-gray-500 text-sm font-medium">Tests Available</h3>
                            <div className="text-2xl font-bold text-gray-900">{totalTests}</div>
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm">Fresh tests added weekly.</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                            <Target size={24} />
                        </div>
                        <div>
                            <h3 className="text-gray-500 text-sm font-medium">Target Score</h3>
                            <div className="text-2xl font-bold text-gray-900">16+</div>
                        </div>
                    </div>
                    <p className="text-gray-500 text-sm">Aim for 80% accuracy per set.</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search tests..."
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
            </div>

            {/* Test Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tests.map((test) => (
                    <div key={test.id} className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-lg">
                                #{test.id}
                            </div>
                            <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">
                                Live
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                            {test.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Questions {test.range}</p>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                            <div className="flex items-center gap-1.5">
                                <Clock size={14} /> {test.duration}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <BarChart3 size={14} /> {test.marks} Marks
                            </div>
                        </div>

                        <button
                            onClick={() => navigate(`/practice/test/${test.id}`)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-50 text-gray-900 font-semibold rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all"
                        >
                            Start Test <ChevronRight size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
