import { useState } from 'react';
import { BookOpen, Target, Brain, Sparkles, ArrowRight, ArrowLeft, Search, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

const SUBJECTS = [
    { id: 'Polity', icon: '🏛️', color: 'bg-orange-100 text-orange-700' },
    { id: 'History', icon: '📜', color: 'bg-amber-100 text-amber-700' },
    { id: 'Geography', icon: '🌍', color: 'bg-green-100 text-green-700' },
    { id: 'Economy', icon: '💰', color: 'bg-blue-100 text-blue-700' },
    { id: 'Environment', icon: '🌱', color: 'bg-emerald-100 text-emerald-700' },
    { id: 'Science & Tech', icon: '🚀', color: 'bg-purple-100 text-purple-700' },
    { id: 'Current Affairs', icon: '📰', color: 'bg-red-100 text-red-700' }
];

export default function GenerateMCQ({ onGenerated }) {
    const [step, setStep] = useState(1);
    const [subject, setSubject] = useState(null);
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [customTopic, setCustomTopic] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mode, setMode] = useState(null); // 'prelims' | 'mains'

    // Step 1: Subject Selection
    const handleSubjectSelect = async (subj) => {
        setSubject(subj);
        setLoading(true);
        setError('');
        try {
            const data = await api.getPracticeTopics(subj.id);
            if (data && Array.isArray(data)) {
                setTopics(data);
                setStep(2);
            } else {
                setError('Failed to load topics. Please try again.');
            }
        } catch (e) {
            setError('Connection error. Please check your internet.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Topic Selection
    const handleTopicSelect = (topic) => {
        setSelectedTopic(topic);
        setStep(3);
    };

    const handleCustomTopic = () => {
        if (!customTopic.trim()) return;
        setSelectedTopic({ topic: customTopic, difficulty: 'Custom', type: 'User' });
        setStep(3);
    };

    // Step 3: Generation
    const handleGenerate = async (selectedMode) => {
        setMode(selectedMode);
        setLoading(true);
        try {
            const result = await api.generatePracticeQuestions(selectedTopic.topic, selectedMode);
            if (result) {
                // Pass questions and mode back to parent
                // Ideally, result is { mcqs: [...] } or { mains: [...] } depending on mode or result structure
                // Backend returns array for Prelims, or potentially Mains structure
                // Checking backend controller: res.json(result)
                // ai.generateMCQFromTopic returns array
                // ai.generateMainsQuestions returns array

                onGenerated(result, selectedMode);
            } else {
                setError('Failed to generate questions. Try a different topic.');
            }
        } catch (e) {
            setError('Generation failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles size={20} className="text-blue-600" />
                    </div>
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-800">
                    {step === 1 ? 'Curating Topics...' : 'Generating Questions...'}
                </h3>
                <p className="text-gray-500 mt-2">Consulting StudyIQ AI</p>
            </div>
        );
    }

    // Wizard Screens
    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header / Nav */}
            <div className="mb-8">
                {step > 1 && (
                    <button onClick={() => setStep(step - 1)} className="text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-4">
                        <ArrowLeft size={16} /> Back
                    </button>
                )}
                <h1 className="text-3xl font-bold text-gray-900">
                    {step === 1 && "Choose Your Subject"}
                    {step === 2 && `Select a Topic from ${subject?.id}`}
                    {step === 3 && "How do you want to practice?"}
                </h1>
                <p className="text-gray-500 mt-2">
                    {step === 1 && "Start your personalized practice session."}
                    {step === 2 && "Pick a high-yield topic or enter your own."}
                    {step === 3 && "Select the exam mode for your questions."}
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl mb-6 flex items-center gap-2">
                    <span className="font-bold">Error:</span> {error}
                </div>
            )}

            {/* Step 1: Subjects */}
            {step === 1 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {SUBJECTS.map((subj) => (
                        <button
                            key={subj.id}
                            onClick={() => handleSubjectSelect(subj)}
                            className={cn(
                                "p-6 rounded-2xl border-2 border-transparent hover:border-blue-500 transition-all text-left group",
                                "bg-white shadow-sm hover:shadow-md"
                            )}
                        >
                            <span className={cn("inline-block w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4", subj.color)}>
                                {subj.icon}
                            </span>
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600">{subj.id}</h3>
                            <p className="text-xs text-gray-400 mt-1">Generate Topics</p>
                        </button>
                    ))}
                </div>
            )}

            {/* Step 2: Topics */}
            {step === 2 && (
                <div className="space-y-6">
                    {/* Custom Topic Input */}
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-2">
                        <Search className="text-gray-400 ml-2" size={20} />
                        <input
                            type="text"
                            placeholder="Type any specific topic (e.g., 'Anti-Defection Law')..."
                            className="flex-1 p-2 outline-none text-gray-700"
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCustomTopic()}
                        />
                        <button
                            onClick={handleCustomTopic}
                            disabled={!customTopic.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            Go
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {topics.map((t, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleTopicSelect(t)}
                                className="p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-left flex items-start justify-between group"
                            >
                                <div>
                                    <h4 className="font-semibold text-gray-800 group-hover:text-blue-700">{t.topic}</h4>
                                    <div className="flex gap-2 mt-2">
                                        <span className={cn("text-xs px-2 py-0.5 rounded-full",
                                            t.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                                t.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                        )}>
                                            {t.difficulty}
                                        </span>
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t.type}</span>
                                    </div>
                                </div>
                                <ArrowRight className="text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" size={20} />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Step 3: Mode */}
            {step === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    <button
                        onClick={() => handleGenerate('prelims')}
                        className="p-8 bg-white border-2 border-transparent hover:border-purple-500 rounded-2xl shadow-sm hover:shadow-xl transition-all text-left group"
                    >
                        <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Target size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Prelims Mode</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Generate MCQ-style questions with detailed explanations and elimination tricks.
                        </p>
                    </button>

                    <button
                        onClick={() => handleGenerate('mains')}
                        className="p-8 bg-white border-2 border-transparent hover:border-orange-500 rounded-2xl shadow-sm hover:shadow-xl transition-all text-left group"
                    >
                        <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <BookOpen size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Mains Mode</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Generate subjective questions with "Assessment Framework" (Demand, Structure, Key Points).
                        </p>
                    </button>
                </div>
            )}
        </div>
    );
}
