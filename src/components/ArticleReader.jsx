import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, CheckCircle2, XCircle, Trophy, BarChart3, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';
import { marked } from 'marked';

export default function ArticleReader({ article, onClose, onNext, onPrev }) {
    if (!article) return null;
    const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'practice'
    const [mcqs, setMcqs] = useState([]);
    const [loadingMcqs, setLoadingMcqs] = useState(false);
    const [answers, setAnswers] = useState({}); // { mcqId: { option, correct } }
    const [showExplanation, setShowExplanation] = useState({});
    const [leaderboard, setLeaderboard] = useState([]);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    // Chat State
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);

    // Load chat from session storage on mount
    useEffect(() => {
        const savedChat = sessionStorage.getItem('StudyIQ AI_chat_session');
        if (savedChat) {
            try {
                setChatHistory(JSON.parse(savedChat));
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        }
    }, []);

    // Save chat to session storage whenever it changes
    useEffect(() => {
        if (chatHistory.length > 0) {
            sessionStorage.setItem('StudyIQ AI_chat_session', JSON.stringify(chatHistory));
        }
    }, [chatHistory]);

    // Reset state when article changes
    useEffect(() => {
        setMcqs([]);
        setAnswers({});
        setShowExplanation({});
        setShowLeaderboard(false);
        setAnalysis(null);
        setActiveTab('summary');

        // Trigger Analysis
        loadAnalysis();
    }, [article.id]);

    const loadAnalysis = async () => {
        setAnalyzing(true);
        try {
            const data = await api.getArticleAnalysis(article.id);
            setAnalysis(data);
        } catch (error) {
            console.error("Failed to load analysis", error);
        }
        setAnalyzing(false);
    };

    // Fetch MCQs when switch to Practice tab
    useEffect(() => {
        if (activeTab === 'practice' && mcqs.length === 0) {
            loadMcqs();
        }
    }, [activeTab]);

    const loadMcqs = async () => {
        setLoadingMcqs(true);
        try {
            const data = await api.getArticleMCQs(article.id);
            if (Array.isArray(data)) {
                setMcqs(data);
            } else {
                console.error("Invalid MCQ data format received:", data);
                setMcqs([]);
            }
        } catch (error) {
            console.error("Failed to load MCQs", error);
            setMcqs([]);
        }
        setLoadingMcqs(false);
    };

    const handleAnswer = async (mcqId, optionId) => {
        if (answers[mcqId]) return; // Already answered

        const mcq = mcqs.find(m => m.id === mcqId);
        if (!mcq) return;

        const isCorrect = optionId === mcq.correct_answer;

        setAnswers(prev => ({
            ...prev,
            [mcqId]: { option: optionId, isCorrect }
        }));
        setShowExplanation(prev => ({ ...prev, [mcqId]: true }));

        // Submit to backend
        try {
            await api.submitArticleAttempt(article.id, {
                user_id: "current_user", // Replace with real auth ID later
                mcq_id: mcqId,
                selected_option: optionId
            });
            // If finished all, load leaderboard
            if (Object.keys(answers).length + 1 === mcqs.length) {
                const lb = await api.getLeaderboard();
                if (Array.isArray(lb)) {
                    setLeaderboard(lb);
                    setShowLeaderboard(true);
                }
            }
        } catch (error) {
            console.error("Failed to submit answer", error);
        }
    }


    const handleChatSubmit = async () => {
        if (!chatInput.trim() || chatLoading) return;

        const userMsg = chatInput.trim();
        setChatInput('');
        setChatLoading(true);

        // Optimistic UI update
        const newHistory = [
            ...chatHistory,
            { role: 'user', parts: [{ text: userMsg }] }
        ];
        setChatHistory(newHistory);

        try {
            // Call API
            const response = await api.sendChat(userMsg, chatHistory); // Send previous history

            if (response && response.response) {
                const updatedHistory = [
                    ...newHistory,
                    { role: 'model', parts: [{ text: response.response }] }
                ];
                setChatHistory(updatedHistory);
            }
        } catch (error) {
            console.error("Chat failed", error);
        }
        setChatLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-50 flex animate-in slide-in-from-bottom-10 duration-300">
            {/* Sidebar - Navigation & ToC */}
            <aside className="w-72 bg-white border-r border-gray-200 hidden lg:flex flex-col h-full sticky left-0 top-0">
                <div className="p-6 border-b border-gray-100">
                    <button onClick={onClose} className="flex items-center gap-2 text-gray-500 hover:text-black transition-colors mb-6">
                        <ChevronLeft size={18} />
                        <span className="font-medium text-sm">Back to Feed</span>
                    </button>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-3">{article.title}</h3>
                </div>

                <div className="p-4">
                    <div className="bg-gray-100 p-1 rounded-xl flex gap-1 mb-6">
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={cn(
                                "flex-1 py-2 text-sm font-bold rounded-lg transition-all",
                                activeTab === 'summary' ? "bg-white shadow text-black" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            Read
                        </button>
                        <button
                            onClick={() => {
                                // Navigate to standalone quiz page
                                window.location.href = `/current-affairs/quiz/${article.id}`;
                            }}
                            className={cn(
                                "flex-1 py-2 text-sm font-bold rounded-lg transition-all text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            )}
                        >
                            Practice Now
                        </button>
                    </div>

                    {activeTab === 'summary' ? (
                        <div className="space-y-1">
                            {['Summary', 'Key Highlights', 'UPSC Relevance', 'Deep Dive Analysis'].map((section) => (
                                <button key={section} className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                                    {section}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Progress</div>
                            <div className="flex gap-1 flex-wrap">
                                {mcqs.map((_, i) => (
                                    <div key={i} className={cn(
                                        "w-8 h-1 rounded-full",
                                        i < Object.keys(answers).length ? "bg-green-500" : "bg-gray-200"
                                    )}></div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 h-full overflow-y-auto bg-white relative">
                {/* Floating Nav Buttons */}
                <div className="fixed bottom-8 right-96 z-50 flex gap-2">
                    <button
                        onClick={onPrev}
                        disabled={!onPrev}
                        className="p-3 bg-white shadow-lg border border-gray-200 rounded-full hover:bg-gray-50 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft />
                    </button>
                    <button
                        onClick={onNext}
                        disabled={!onNext}
                        className="p-3 bg-black shadow-lg text-white rounded-full hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight />
                    </button>
                </div>

                <div className="max-w-3xl mx-auto px-8 py-12">
                    {activeTab === 'summary' ? (
                        <article className="prose prose-blue max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: marked.parse(article.content || '') }} />
                        </article>
                    ) : (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold">Concept Check</h2>
                                <span className="text-sm font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                                    {Object.keys(answers).length}/{mcqs.length || 0} Answered
                                </span>
                            </div>

                            {loadingMcqs && <div className="text-center py-20 text-gray-400">Loading AI Questions...</div>}

                            {!loadingMcqs && mcqs.length === 0 && (
                                <div className="text-center py-20 text-gray-500">
                                    No MCQs generated for this article yet.
                                </div>
                            )}

                            {mcqs.map((mcq, idx) => (
                                <Card key={mcq.id} className="p-6 mb-6">
                                    <div className="flex gap-4">
                                        <span className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-600 text-sm">
                                            {idx + 1}
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-medium text-lg text-gray-900 mb-6">{mcq.question}</p>
                                            <div className="space-y-3">
                                                {mcq.options.map((opt) => {
                                                    const isSelected = answers[mcq.id]?.option === opt.id;
                                                    const isCorrect = mcq.correct_answer === opt.id;
                                                    const showResult = !!answers[mcq.id];

                                                    let btnClass = "w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-all text-gray-700";
                                                    if (showResult) {
                                                        if (isCorrect) btnClass = "w-full text-left p-4 rounded-xl border border-green-200 bg-green-50 text-green-800 font-medium";
                                                        else if (isSelected) btnClass = "w-full text-left p-4 rounded-xl border border-red-200 bg-red-50 text-red-800";
                                                        else btnClass = "w-full text-left p-4 rounded-xl border border-gray-100 bg-gray-50 text-gray-400 opacity-60";
                                                    }

                                                    return (
                                                        <button
                                                            key={opt.id}
                                                            disabled={showResult}
                                                            onClick={() => handleAnswer(mcq.id, opt.id)}
                                                            className={btnClass}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span>{opt.text}</span>
                                                                {showResult && isCorrect && <CheckCircle2 className="text-green-600" size={20} />}
                                                                {showResult && isSelected && !isCorrect && <XCircle className="text-red-600" size={20} />}
                                                            </div>
                                                        </button>
                                                    )
                                                })}
                                            </div>

                                            {showExplanation[mcq.id] && (
                                                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                    <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                                                        <Sparkles size={16} className="text-yellow-500" /> Explanation
                                                    </h4>
                                                    <p className="text-sm text-gray-600 leading-relaxed">{mcq.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            {/* Leaderboard Section */}
                            {showLeaderboard && (
                                <div className="mt-12 p-8 bg-black text-white rounded-2xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold flex items-center gap-2">
                                            <Trophy className="text-yellow-400" /> Leaderboard
                                        </h3>
                                        <span className="text-sm text-gray-400">Top Performers</span>
                                    </div>
                                    <div className="space-y-4">
                                        {leaderboard.map((user) => (
                                            <div key={user.rank} className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 h-6 bg-yellow-500 text-black text-xs font-bold rounded flex items-center justify-center">
                                                        #{user.rank}
                                                    </span>
                                                    <span className="font-medium">User {user.user_id}</span>
                                                </div>
                                                <span className="font-bold">{user.score} pts</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Right Panel - AI Integration */}
            <aside className="w-96 bg-gray-50 border-l border-gray-200 hidden xl:flex flex-col h-full sticky right-0 top-0">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles size={18} className="text-blue-600" />
                        Ask Kalam
                    </h3>
                </div>
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                        <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <BarChart3 size={16} className="text-purple-500" /> Toneality Analysis
                        </h4>

                        {analyzing ? (
                            <div className="animate-pulse space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-2 bg-gray-200 rounded"></div>
                            </div>
                        ) : analysis ? (
                            <div className="space-y-3">
                                <div className="text-xs text-gray-500">
                                    <div className="flex justify-between mb-1">
                                        <span>Tone: {analysis.tone}</span>
                                        <span className="font-bold text-gray-900">{analysis.readability_score * 10}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${analysis.readability_score * 10}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                    <div className="flex justify-between mb-1">
                                        <span>Keywords</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {analysis.keywords?.map((kw, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium border border-blue-100">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 mt-4 leading-relaxed italic border-l-2 border-purple-200 pl-3">
                                    "{analysis.feedback}"
                                </p>
                            </div>
                        ) : (
                            <div className="text-xs text-center text-gray-400 py-4">Analysis unavailable</div>
                        )}
                    </div>

                    {/* Chat History */}
                    <div className="space-y-4">
                        {chatHistory.map((msg, idx) => (
                            <div key={idx} className={cn("flex flex-col gap-1 text-xs", msg.role === 'user' ? "items-end" : "items-start")}>
                                <div className={cn(
                                    "px-3 py-2 rounded-lg max-w-[85%]",
                                    msg.role === 'user' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                                )}>
                                    {msg.parts[0].text}
                                </div>
                            </div>
                        ))}
                        {chatLoading && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Sparkles size={12} className="animate-spin" /> Thinking...
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-4 bg-white border-t border-gray-200">
                    <div className="relative">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                            placeholder="Ask a doubt..."
                            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                            disabled={chatLoading}
                        />
                        <button
                            onClick={handleChatSubmit}
                            disabled={chatLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                        >
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
}

function Card({ children, className }) {
    return (
        <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm", className)}>
            {children}
        </div>
    );
}

function ArrowRight2({ size }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
    )
}
