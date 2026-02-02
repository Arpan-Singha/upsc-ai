import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Circle, X } from 'lucide-react';
import { Card } from './ui/Card';

export default function DailyProgressCalendar({ history = [] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    // Helpers
    const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    // Data Map
    const historyMap = {};
    if (history) {
        history.forEach(item => {
            if (item.date) {
                // Ensure date match (item.date is YYYY-MM-DD)
                historyMap[item.date] = item;
            }
            // Also handle fullDate if present (YYYY-MM-DD from previous padding)
            if (item.fullDate) {
                historyMap[item.fullDate] = item;
            }
        });
    }

    const renderCalendar = () => {
        const days = [];
        const totalDays = getDaysInMonth(currentDate);
        const startDay = getFirstDayOfMonth(currentDate);

        // Padding for starts
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
        }

        // Days
        for (let d = 1; d <= totalDays; d++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const data = historyMap[dateStr];

            // Status Logic
            // Green (Completed): MCQs >= 5 OR Hours >= 1 (Arbitrary target for now)
            // Yellow (In Progress): Any activity > 0
            // Gray: None
            let status = 'none';
            if (data) {
                if (data.mcqs >= 5 || data.hours >= 1) status = 'completed';
                else if (data.mcqs > 0 || data.hours > 0) status = 'progress';
            }

            // Selection
            const isSelected = selectedDate === dateStr;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            days.push(
                <div key={d} className="flex flex-col items-center gap-1 relative group">
                    <button
                        onClick={() => setSelectedDate(dateStr)}
                        className={`
                            h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium transition-all
                            ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                            ${status === 'completed' ? 'bg-green-100 text-green-700 font-bold' : ''}
                            ${status === 'progress' ? 'bg-yellow-100 text-yellow-700' : ''}
                            ${status === 'none' ? 'text-gray-500 hover:bg-gray-100' : ''}
                            ${isToday && status === 'none' ? 'bg-blue-50 text-blue-600 border border-blue-200' : ''}
                        `}
                    >
                        {d}
                    </button>
                    {/* Status Dot (Visual Reinforcement) */}
                    {status === 'completed' && <div className="w-1 h-1 bg-green-500 rounded-full"></div>}
                    {status === 'progress' && <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>}
                </div>
            );
        }

        return days;
    };

    // Popup Data
    const selectedData = selectedDate ? historyMap[selectedDate] : null;

    return (
        <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Daily Progress</h3>

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full">
                    <ChevronLeft size={20} className="text-gray-500" />
                </button>
                <div className="font-bold text-gray-800 text-lg">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </div>
                <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full">
                    <ChevronRight size={20} className="text-gray-500" />
                </button>
            </div>

            {/* Grid Header */}
            <div className="grid grid-cols-7 text-center mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} className="text-xs font-medium text-gray-400 uppercase tracking-wider">{day}</div>
                ))}
            </div>

            {/* Grid Body */}
            <div className="grid grid-cols-7 gap-y-4 justify-items-center">
                {renderCalendar()}
            </div>

            {/* Legend */}
            <div className="flex gap-4 justify-center mt-8 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-green-500" /> Completed
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-yellow-500" /> In Progress
                </div>
                <div className="flex items-center gap-1.5">
                    <Circle size={14} className="text-gray-300" /> Not Started
                </div>
            </div>

            {/* Detail Popup Overlay */}
            {selectedDate && (
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/50 backdrop-blur-sm flex items-center justify-center p-4 rounded-3xl animate-in fade-in zoom-in-95 z-10" onClick={() => setSelectedDate(null)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-[280px] p-0 overflow-hidden border border-gray-100" onClick={e => e.stopPropagation()}>
                        <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                            <span className="font-bold">
                                {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                            </span>
                            <button onClick={() => setSelectedDate(null)} className="hover:bg-white/20 p-1 rounded-full"><X size={16} /></button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-sm text-gray-500">Articles Read</span>
                                <span className="font-bold text-gray-900">
                                    {/* Mocking Read Count for now as requested */}
                                    {selectedData ? Math.floor(selectedData.hours * 2) : 0}
                                    <span className="text-xs text-gray-400 font-normal ml-1">est.</span>
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                                <span className="text-sm text-gray-500">MCQs Solved</span>
                                <span className="font-bold text-indigo-600">{selectedData?.mcqs || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Study Time</span>
                                <span className="font-bold text-orange-600">{selectedData?.hours || 0}h</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
