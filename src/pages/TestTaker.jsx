import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function TestTaker() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(7200); // 2 hours
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        api.getPaperQuestions(id).then(data => data && setQuestions(data));

        const timer = setInterval(() => {
            setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [id]);

    const handleOptionSelect = (opt) => {
        if (submitted) return;
        setAnswers({ ...answers, [questions[currentIndex].id]: opt });
    };

    const handleSubmit = async () => {
        // Calculate Actual Results
        let correctCount = 0;
        let score = 0;

        questions.forEach(q => {
            // q.correct_answer is 'a', 'b', etc.
            // answers[q.id] is 'A', 'B', etc. (uppercase from handleOptionSelect)
            // Need to normalize case
            const selected = answers[q.id]?.toLowerCase();
            if (selected === q.correct_answer?.toLowerCase()) {
                correctCount++;
                score += 2;
            }
        });

        await api.submitTest({
            score,
            total: questions.length * 2,
            correct: correctCount,
            subject: 'PYQ',
            testId: id
        });
        setSubmitted(true);
    };

    if (questions.length === 0) return <div className="flex h-screen items-center justify-center">Loading Test...</div>;

    const currentQ = questions[currentIndex];
    const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    if (submitted) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="bg-white p-10 rounded-2xl shadow-xl text-center">
                    <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Submitted!</h1>
                    <p className="text-gray-500 mb-6">Your responses have been recorded.</p>
                    <button onClick={() => navigate('/practice/pyqs')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium">Back to Practice</button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-white">
            {/* Left: Question Area */}
            <main className="flex-1 flex flex-col h-full">
                <header className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft /></button>
                        <span className="font-bold text-lg">Paper {id}</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-600 font-mono font-bold text-xl bg-red-50 px-4 py-2 rounded-lg">
                        <Clock size={20} /> {formatTime(timeLeft)}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
                    <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Question {currentIndex + 1} of {questions.length}</span>
                    <h2 className="text-2xl font-medium text-gray-900 mt-4 mb-8 leading-relaxed">{currentQ.text}</h2>

                    <div className="space-y-4">
                        {['option_a', 'option_b', 'option_c', 'option_d'].map((key) => {
                            const optLabel = key.split('_')[1].toUpperCase();
                            const isSelected = answers[currentQ.id] === optLabel;
                            return (
                                <div
                                    key={key}
                                    onClick={() => handleOptionSelect(optLabel)}
                                    className={cn(
                                        "flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all",
                                        isSelected ? "border-blue-600 bg-blue-50" : "border-gray-100 hover:border-gray-200"
                                    )}
                                >
                                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold border", isSelected ? "bg-blue-600 border-blue-600 text-white" : "text-gray-500 border-gray-300")}>{optLabel}</div>
                                    <span className="text-lg text-gray-700">{currentQ[key]}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <footer className="p-4 border-t border-gray-200 flex justify-between max-w-4xl mx-auto w-full">
                    <button
                        disabled={currentIndex === 0}
                        onClick={() => setCurrentIndex(c => c - 1)}
                        className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => currentIndex < questions.length - 1 ? setCurrentIndex(c => c + 1) : handleSubmit()}
                        className={cn("px-8 py-3 rounded-xl font-medium text-white shadow-lg shadow-blue-500/30", currentIndex < questions.length - 1 ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700")}
                    >
                        {currentIndex < questions.length - 1 ? 'Next Question' : 'Submit Test'}
                    </button>
                </footer>
            </main>

            {/* Right: Palette */}
            <aside className="w-80 border-l border-gray-200 p-6 hidden lg:flex flex-col">
                <h3 className="font-bold text-gray-900 mb-4">Question Palette</h3>
                <div className="grid grid-cols-5 gap-3">
                    {questions.map((q, idx) => {
                        const isAnswered = answers[q.id];
                        const isCurrent = idx === currentIndex;
                        return (
                            <button
                                key={q.id}
                                onClick={() => setCurrentIndex(idx)}
                                className={cn(
                                    "w-10 h-10 rounded-lg font-medium text-sm flex items-center justify-center transition-all",
                                    isCurrent ? "ring-2 ring-blue-500 ring-offset-2" : "",
                                    isAnswered ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                )}
                            >
                                {idx + 1}
                            </button>
                        )
                    })}
                </div>

                <div className="mt-auto space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600"><div className="w-4 h-4 bg-green-500 rounded"></div> Answered</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600"><div className="w-4 h-4 bg-gray-100 rounded"></div> Not Visited</div>
                </div>
            </aside>
        </div>
    );
}
