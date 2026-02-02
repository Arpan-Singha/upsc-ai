import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import GenerateMCQ from '../components/GenerateMCQ';
import TestInterface from '../components/test/TestInterface';
import { supabase } from '../lib/supabaseClient';
import {
    Clock, CheckCircle2, XCircle, Trophy, ArrowLeft, RefreshCw, BookOpen, Sparkles, FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export default function MCQPractice() {
    const navigate = useNavigate();
    const { testId } = useParams();
    const [wizardActive, setWizardActive] = useState(!testId);
    const [loading, setLoading] = useState(false);

    // Data
    const [mcqs, setMcqs] = useState([]);
    const [mainsQuestions, setMainsQuestions] = useState([]);

    // State
    const [answers, setAnswers] = useState({});
    const [isComplete, setIsComplete] = useState(false);
    const [mode, setMode] = useState('prelims');
    const [timeLeft, setTimeLeft] = useState(600); // 10 mins default

    // Fetch Test if ID provided
    useEffect(() => {
        if (testId) {
            setLoading(true);
            setWizardActive(false);
            setMode('prelims');

            async function fetchTestQuestions() {
                const id = parseInt(testId);
                const start = (id - 1) * 10;
                const end = start + 9;

                const { data, error } = await supabase
                    .from('questions')
                    .select('*')
                    .range(start, end);

                if (data) {
                    const formatted = data.map(q => ({
                        id: q.id,
                        question: q.question,
                        options: [
                            { id: 'a', text: q.option_a },
                            { id: 'b', text: q.option_b },
                            { id: 'c', text: q.option_c },
                            { id: 'd', text: q.option_d }
                        ].filter(opt => opt.text && opt.text !== 'NULL' && opt.text.trim() !== ''),
                        correct_answer: q.correct ? q.correct.toLowerCase() : 'a',
                        explanation: q.solution,
                        tags: q.subject ? [q.subject] : ['General'],
                        topic: q.subject || 'General' // For Interface
                    }));
                    setMcqs(formatted);
                    setTimeLeft(formatted.length * 120); // 2 mins per Q
                } else {
                    console.error("Error fetching test:", error);
                }
                setLoading(false);
            }
            fetchTestQuestions();
        }
    }, [testId]);

    const handleGenerated = (data, selectedMode) => {
        setMode(selectedMode);
        if (selectedMode === 'prelims') {
            const formatted = Array.isArray(data) ? data.map((q, i) => ({
                ...q,
                id: q.id || i, // Ensure ID
                topic: 'AI Generated'
            })) : [];
            setMcqs(formatted);
            setTimeLeft((formatted.length || 5) * 120);
        } else {
            setMainsQuestions(Array.isArray(data) ? data : []);
        }
        setWizardActive(false);
    };

    const handleAnswer = (qId, optId) => {
        setAnswers(prev => ({ ...prev, [qId]: { option: optId } }));
    };

    const handleFinish = async () => {
        setIsComplete(true);
        window.scrollTo(0, 0);

        // Calculate Results
        let correctCount = 0;
        let score = 0;
        mcqs.forEach(q => {
            if (answers[q.id]?.option === q.correct_answer) {
                correctCount++;
                score += 2;
            }
        });

        // Submit to Backend
        try {
            await api.submitTest({
                score,
                total: mcqs.length * 2,
                correct: correctCount,
                subject: mcqs[0]?.topic || 'General',
                testId: testId || 'practice'
            });
        } catch (e) {
            console.error("Failed to save results", e);
        }
    };

    // --- Render Logic ---

    // 1. Wizard
    if (wizardActive) {
        return <GenerateMCQ onGenerated={handleGenerated} />;
    }

    // 2. Mains View (unchanged for now, kept simple)
    if (mode === 'mains') {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <button
                    onClick={() => setWizardActive(true)}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft size={20} /> Back to Topics
                </button>
                {/* Mains Content Reuse from before */}
                <div className="space-y-8">
                    {mainsQuestions.map((q, idx) => (
                        <Card key={idx} className="p-8">
                            <h3 className="text-xl font-semibold mb-4">{q.question}</h3>
                            <p className="text-gray-600 italic">Reference guidance provided.</p>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    // 3. Result View (Detailed)
    if (isComplete) {
        let correctCount = 0;
        let score = 0;
        mcqs.forEach(q => {
            if (answers[q.id]?.option === q.correct_answer) {
                correctCount++;
                score += 2; // Assuming 2 marks per Q
            }
        });

        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-3xl mx-auto space-y-8">
                    {/* Score Card */}
                    <Card className="p-8 text-center bg-white shadow-sm border-blue-100">
                        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h1>
                        <p className="text-gray-500 mb-6">You scored {score}/{mcqs.length * 2} marks.</p>

                        <div className="flex justify-center gap-4">
                            <div className="bg-green-50 text-green-700 px-6 py-3 rounded-xl font-bold border border-green-100">
                                {correctCount} Correct
                            </div>
                            <div className="bg-red-50 text-red-700 px-6 py-3 rounded-xl font-bold border border-red-100">
                                {mcqs.length - correctCount} Incorrect
                            </div>
                        </div>

                        <div className="mt-8 flex justify-center gap-4">
                            <button
                                onClick={() => navigate('/practice/tests')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors"
                            >
                                Back to All Tests
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50"
                            >
                                Retake Test
                            </button>
                        </div>
                    </Card>

                    {/* Detailed Analysis */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-900 px-2">Detailed Analysis</h2>
                        {mcqs.map((q, idx) => {
                            const userAnswer = answers[q.id]?.option;
                            const isCorrect = userAnswer === q.correct_answer;
                            const isSkipped = !userAnswer;

                            return (
                                <Card key={q.id} className={cn(
                                    "p-6 border-l-4",
                                    isCorrect ? "border-l-green-500" : isSkipped ? "border-l-gray-300" : "border-l-red-500"
                                )}>
                                    <div className="flex gap-4">
                                        <div className="font-bold text-gray-500">Q{idx + 1}.</div>
                                        <div className="flex-1">
                                            <p className="text-lg font-medium text-gray-900 mb-4">{q.question}</p>

                                            {/* Options */}
                                            <div className="space-y-2 mb-4">
                                                {q.options.map(opt => {
                                                    const isSelected = userAnswer === opt.id;
                                                    const isRight = q.correct_answer === opt.id;

                                                    let style = "bg-gray-50 text-gray-600 border-transparent";
                                                    if (isRight) style = "bg-green-100 text-green-800 border-green-300 font-bold";
                                                    else if (isSelected && !isRight) style = "bg-red-100 text-red-800 border-red-300";

                                                    return (
                                                        <div key={opt.id} className={cn("p-3 rounded-lg border flex justify-between items-center", style)}>
                                                            <span>{opt.text}</span>
                                                            {isRight && <CheckCircle2 size={18} className="text-green-600" />}
                                                            {isSelected && !isRight && <XCircle size={18} className="text-red-600" />}
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            {/* Explanation */}
                                            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-900 border border-blue-100">
                                                <span className="font-bold">Explanation:</span> {q.explanation || 'No explanation provided.'}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // 4. Test Interface (Prelims)
    return (
        <TestInterface
            title={testId ? `UPSC Prelims Mock Test ${testId}` : "AI Generated Practice"}
            questions={mcqs}
            answers={answers}
            onAnswer={handleAnswer}
            onFinish={handleFinish}
            timeLeft={timeLeft}
        />
    );
}
