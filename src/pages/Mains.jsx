import { useState } from 'react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';

export default function Mains() {
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState(null);

    const handleSubmit = async () => {
        if (!answer.trim()) return;
        const res = await api.submitAnswer({ userId: "user1", questionId: 101, answerText: answer });
        if (res) setFeedback(res);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Mains Answer Writing</h1>

            <Card>
                <div className="mb-4">
                    <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">Daily Challenge</span>
                    <h2 className="text-xl font-bold text-gray-900 mt-2">Critically examine the role of the Election Commission of India in ensuring free and fair elections. (250 words)</h2>
                </div>

                <textarea
                    className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none bg-gray-50"
                    placeholder="Type your answer here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                />

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Submit for Evaluation
                    </button>
                </div>
            </Card>

            {feedback && (
                <Card className="bg-green-50 border-green-200">
                    <h3 className="text-lg font-bold text-green-900 mb-2">AI Evaluation</h3>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-3xl font-bold text-green-700">{feedback.score}/10</span>
                        <span className="text-sm text-green-600">Score</span>
                    </div>
                    <p className="text-green-800">{feedback.feedback}</p>
                </Card>
            )}
        </div>
    );
}
