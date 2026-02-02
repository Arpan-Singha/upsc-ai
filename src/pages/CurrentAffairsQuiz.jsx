import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import TestInterface from '../components/test/TestInterface';
import { Sparkles } from 'lucide-react';

export default function CurrentAffairsQuiz() {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [mcqs, setMcqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        loadQuiz();
    }, [id]);

    const loadQuiz = async () => {
        setLoading(true);
        try {
            const data = await api.getArticleMCQs(id);
            if (Array.isArray(data)) {
                // Parse options if they are strings
                const formatted = data.map(q => ({
                    ...q,
                    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
                    // Ensure each option has an id if missing
                    options: (typeof q.options === 'string' ? JSON.parse(q.options) : q.options).map((opt, i) => ({
                        ...opt,
                        id: opt.id || String.fromCharCode(97 + i) // 'a', 'b', etc if missing
                    }))
                }));
                setMcqs(formatted);
            }
        } catch (error) {
            console.error("Failed to load quiz", error);
        }
        setLoading(false);
    };

    const handleAnswer = async (mcqId, optionId) => {
        // Optimistic update
        setAnswers(prev => ({
            ...prev,
            [mcqId]: { option: optionId }
        }));

        try {
            await api.submitArticleAttempt(id, {
                user_id: "current_user",
                mcq_id: mcqId,
                selected_option: optionId
            });

            // Check if all answered
            if (Object.keys(answers).length + 1 === mcqs.length) {
                const lb = await api.getLeaderboard();
                setLeaderboard(lb);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleFinish = async () => {
        // Show Leaderboard Modal or Navigate
        const lb = await api.getLeaderboard();
        setLeaderboard(lb);
        setShowLeaderboard(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Sparkles className="animate-spin text-blue-600" size={32} />
                    <p className="text-gray-500 font-medium">Generating AI Questions...</p>
                </div>
            </div>
        );
    }

    if (!mcqs.length) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900">No Quiz Available</h2>
                    <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (showLeaderboard) {
        return (
            <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in">
                <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative">
                    <button onClick={() => navigate(-1)} className="absolute top-4 right-4 text-gray-400 hover:text-black">X</button>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">🏆 Leaderboard</h2>
                    <div className="space-y-4">
                        {leaderboard.map((user, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 bg-yellow-400 text-black font-bold rounded-full flex items-center justify-center">#{user.rank}</span>
                                    <span className="font-medium">User {user.user_id}</span>
                                </div>
                                <span className="font-bold text-blue-600">{user.score} pts</span>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => navigate(-1)} className="w-full mt-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
                        Close & Return
                    </button>
                </div>
            </div>
        )
    }

    return (
        <TestInterface
            title="Current Affairs AI Quiz"
            questions={mcqs}
            answers={answers}
            onAnswer={handleAnswer}
            onFinish={handleFinish}
            timeLeft={600} // 10 mins
        />
    );
}
