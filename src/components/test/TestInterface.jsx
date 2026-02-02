import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { ChevronLeft, ChevronRight, Clock, Info, User, CheckCircle2, Bookmark } from 'lucide-react';

export default function TestInterface({
    title,
    questions,
    answers,
    onAnswer,
    onFinish,
    timeLeft = 0 // Seconds
}) {
    const [started, setStarted] = useState(false);
    const [showBrutal, setShowBrutal] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visited, setVisited] = useState(new Set([0]));
    const [markedForReview, setMarkedForReview] = useState(new Set());
    const [timer, setTimer] = useState(timeLeft);

    // Timer Logic
    useEffect(() => {
        if (!started) return;
        if (timer <= 0) return;
        const interval = setInterval(() => {
            setTimer(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, [timer, started]);

    const handleStart = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => console.log(err));
        } else if (elem.webkitRequestFullscreen) { /* Safari */
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
            elem.msRequestFullscreen();
        }
        setStarted(true);
    };

    const handleInternalFinish = () => {
        // Validation for Brutal Message
        const attemptedCount = Object.keys(answers).length;
        if (attemptedCount === 0) {
            setShowBrutal(true);
            setTimeout(() => {
                setShowBrutal(false);
                document.exitFullscreen?.().catch(() => { });
                onFinish();
            }, 4000); // 4 seconds
        } else {
            document.exitFullscreen?.().catch(() => { });
            onFinish();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins} Min : ${secs.toString().padStart(2, '0')} Sec`;
    };

    const handleNavigate = (idx) => {
        if (idx >= 0 && idx < questions.length) {
            setCurrentIndex(idx);
            setVisited(prev => new Set(prev).add(idx));
        }
    };

    const toggleMarkForReview = () => {
        setMarkedForReview(prev => {
            const next = new Set(prev);
            if (next.has(currentIndex)) next.delete(currentIndex);
            else next.add(currentIndex);
            return next;
        });
    };

    if (!questions || questions.length === 0) return null;

    // --- Start Overlay ---
    if (!started) {
        return (
            <div className="fixed inset-0 z-50 bg-blue-900/95 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl animate-in fade-in zoom-in">
                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                    <p className="text-gray-500 mb-8">
                        The test will run in <strong>Fullscreen Mode</strong>.
                        Do not exit or switch tabs.
                    </p>
                    <button
                        onClick={handleStart}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
                    >
                        Start Exam Now
                    </button>
                </div>
            </div>
        );
    }

    // --- Brutal Popup ---
    if (showBrutal) {
        return (
            <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6 animate-in fade-in duration-300">
                <div className="bg-red-600 text-white rounded-xl max-w-sm w-full p-6 text-center shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-bounce relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black border-4 border-red-600 w-16 h-16 rounded-full flex items-center justify-center">
                        <span className="text-3xl">🤬</span>
                    </div>
                    <h3 className="mt-8 text-2xl font-black uppercase tracking-wider mb-2">Are you kidding me?</h3>
                    <p className="font-bold text-red-100 leading-relaxed">
                        0 Attempts? Your competition is grinding while you waste time.
                        <br /><br />
                        <span className="bg-white text-red-600 px-2 py-0.5 rounded uppercase text-sm">Get Serious or Go Home.</span>
                    </p>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentIndex];
    const isLastInfo = currentIndex === questions.length - 1;

    // Palette Colors
    const getPaletteClass = (idx) => {
        const isCurrent = idx === currentIndex;
        const isAnswered = answers[questions[idx].id];
        const isMarked = markedForReview.has(idx);
        const isVisited = visited.has(idx);

        if (isCurrent) return "ring-2 ring-blue-600 ring-offset-2";
        if (isMarked) return "bg-purple-100 text-purple-700 border-purple-300";
        if (isAnswered) return "bg-green-100 text-green-700 border-green-300";
        if (isVisited && !isAnswered) return "bg-red-50 text-red-700 border-red-200";

        return "bg-gray-50 text-gray-500 border-gray-200";
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Top Bar */}
            <header className="bg-blue-900 text-white h-16 flex items-center justify-between px-6 shadow-md z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/10 rounded-lg">
                        <span className="font-bold text-lg">P</span>
                    </div>
                    <h1 className="font-medium text-lg truncate max-w-md">{title}</h1>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-center">
                        <div className="text-2xl font-bold font-mono text-green-400">
                            {formatTime(timer)}
                        </div>
                        <div className="text-[10px] text-gray-300 uppercase tracking-widest">Remaining Time</div>
                    </div>

                    <button
                        onClick={handleInternalFinish}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded shadow-lg transition-transform hover:scale-105 font-medium"
                    >
                        Finish Exam
                    </button>

                    <button className="p-2 hover:bg-white/10 rounded-full">
                        <Info size={20} />
                    </button>
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-blue-900 border-2 border-white">
                        <User size={20} />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: Question */}
                <main className="flex-1 overflow-y-auto p-8 lg:p-12 relative">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-gray-500 font-medium">Topic: <span className="text-blue-700 font-bold">{currentQ.topic || 'General'}</span></div>
                        </div>

                        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">
                            Question {currentIndex + 1} of {questions.length}
                        </h2>

                        <div className="prose max-w-none text-lg text-gray-800 mb-8 leading-relaxed">
                            {currentQ.question}
                        </div>

                        <div className="mb-4 font-bold text-gray-700">Select any one of given answer :</div>

                        <div className="space-y-4">
                            {currentQ.options.map((opt, i) => {
                                const isSelected = answers[currentQ.id]?.option === opt.id;
                                return (
                                    <div
                                        key={opt.id}
                                        onClick={() => onAnswer(currentQ.id, opt.id)}
                                        className={cn(
                                            "flex items-stretch border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-md",
                                            isSelected ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-32 flex items-center px-6 font-bold text-sm uppercase",
                                            isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                                        )}>
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                                    isSelected ? "border-white" : "border-gray-400"
                                                )}>
                                                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                </div>
                                                Choice {String.fromCharCode(65 + i)}
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "flex-1 p-4 font-medium",
                                            isSelected ? "bg-blue-50 text-blue-900" : "bg-white text-gray-700"
                                        )}>
                                            {opt.text}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Bottom Sticky Nav for Left Panel */}
                    <div className="mt-12 flex gap-4 border-t pt-8">
                        <button
                            onClick={() => handleNavigate(currentIndex - 1)}
                            disabled={currentIndex === 0}
                            className="px-6 py-3 bg-blue-600 text-white rounded font-medium shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <ChevronLeft size={16} /> Previous Question
                        </button>
                        <button
                            onClick={() => handleNavigate(currentIndex + 1)}
                            disabled={currentIndex === questions.length - 1}
                            className="px-6 py-3 bg-blue-600 text-white rounded font-medium shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            Next Question <ChevronRight size={16} />
                        </button>
                    </div>
                </main>

                {/* Right Panel: Palette */}
                <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0">
                    <div className="p-4 border-b bg-gray-50">
                        <h3 className="font-bold text-gray-900 border-l-4 border-blue-600 pl-3">Question Pallet</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div className="grid grid-cols-4 gap-2">
                            {questions.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleNavigate(idx)}
                                    className={cn(
                                        "h-10 text-sm font-bold border rounded flex items-center justify-center transition-all",
                                        getPaletteClass(idx)
                                    )}
                                >
                                    {idx + 1}
                                </button>
                            ))}
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={toggleMarkForReview}
                                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded border border-gray-300 transition-colors"
                            >
                                {markedForReview.has(currentIndex) ? "Unmark Review" : "Mark For Review"}
                            </button>
                        </div>

                        {/* Legend */}
                        <div className="mt-8 grid grid-cols-2 gap-4 text-xs font-medium text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-green-100 border border-green-300 text-green-700 flex items-center justify-center rounded">A</div>
                                <span>Answered</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-red-50 border border-red-200 text-red-700 flex items-center justify-center rounded">NV</div>
                                <span>Viewed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-purple-100 border border-purple-300 text-purple-700 flex items-center justify-center rounded">M</div>
                                <span>Marked</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-gray-50 border border-gray-200 text-gray-500 flex items-center justify-center rounded">NA</div>
                                <span>Not Visit</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
