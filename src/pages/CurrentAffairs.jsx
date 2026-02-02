import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { ChevronLeft, ChevronRight, Share2, Download, Calendar, BookOpen, CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

// Tag color mapping
const tagColors = {
    'GS 1': 'bg-orange-100 text-orange-700',
    'GS 2': 'bg-blue-100 text-blue-700',
    'GS 3': 'bg-green-100 text-green-700',
    'Prelims': 'bg-purple-100 text-purple-700',
    'Ethics': 'bg-pink-100 text-pink-700',
    'Editorial': 'bg-red-100 text-red-700',
    'default': 'bg-gray-100 text-gray-700'
};

const sourceIcons = {
    'THE HINDU': '📰',
    'INDIAN EXPRESS': '📄',
    'TIMES OF INDIA': '🗞️',
    'default': '📋'
};

import ArticleReader from '../components/ArticleReader';

export default function CurrentAffairs() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [readingArticle, setReadingArticle] = useState(null); // Changed from expandedId

    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }).replace(/ /g, ' ');
    };

    const formatDateForAPI = (date) => {
        return date.toISOString().split('T')[0];
    };

    useEffect(() => {
        async function loadNews() {
            setLoading(true);
            const data = await api.getNews(formatDateForAPI(selectedDate));
            if (data) setNews(data);
            setLoading(false);
        }
        loadNews();
    }, [selectedDate]);

    const navigateDate = (direction) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + direction);
        setSelectedDate(newDate);
    };

    // ... (calendar logic remains same)
    const generateCalendar = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(i);
        }
        return { days, month: today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
    };

    const calendar = generateCalendar();
    const todayDate = new Date().getDate();

    const getTagColor = (tag) => tagColors[tag] || tagColors.default;

    // Navigation Handlers
    const currentIndex = news.findIndex(n => n.id === readingArticle?.id);
    const hasNext = currentIndex < news.length - 1;
    const hasPrev = currentIndex > 0;

    const handleNext = () => {
        if (hasNext) setReadingArticle(news[currentIndex + 1]);
    };

    const handlePrev = () => {
        if (hasPrev) setReadingArticle(news[currentIndex - 1]);
    };

    return (
        <>
            {/* Article Reader Overlay */}
            {readingArticle && (
                <ArticleReader
                    article={readingArticle}
                    onClose={() => setReadingArticle(null)}
                    onNext={hasNext ? handleNext : null}
                    onPrev={hasPrev ? handlePrev : null}
                />
            )}

            <div className="flex gap-6">
                {/* Main Content */}
                <div className="flex-1 space-y-4">
                    {/* Header with Date Navigation */}
                    <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigateDate(-1)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Calendar size={20} className="text-blue-600" />
                                {formatDate(selectedDate)}
                            </h1>
                            <button
                                onClick={() => navigateDate(1)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={selectedDate >= new Date()}
                            >
                                <ChevronRight size={20} className={selectedDate >= new Date() ? 'text-gray-300' : ''} />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">
                                <Share2 size={16} /> Share
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">
                                <Download size={16} /> Download
                            </button>
                        </div>
                    </div>

                    {/* News Feed */}
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {news.map((item) => (
                                <Card
                                    key={item.id}
                                    className="hover:shadow-lg transition-all cursor-pointer group"
                                    onClick={() => setReadingArticle(item)}
                                >
                                    <div className="flex gap-4">
                                        {/* Source Icon */}
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center text-2xl shrink-0">
                                            {sourceIcons[item.source] || sourceIcons.default}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            {/* Tags Row */}
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                {item.category === 'Editorial' && (
                                                    <span className={cn("px-2 py-0.5 rounded text-xs font-bold", tagColors['Editorial'])}>
                                                        Editorial
                                                    </span>
                                                )}
                                                {item.gs_tags?.slice(0, 4).map((tag, idx) => (
                                                    <span
                                                        key={idx}
                                                        className={cn("px-2 py-0.5 rounded text-xs font-medium", getTagColor(tag))}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg font-bold text-blue-700 group-hover:text-blue-800 transition-colors mb-1">
                                                {item.title}{item.page && <span className="text-gray-400 font-normal">, {item.page}</span>}
                                            </h3>

                                            {/* Summary */}
                                            <p className="text-gray-600 text-sm line-clamp-2">
                                                {item.summary}
                                            </p>

                                            {/* Source */}
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                                <span className="font-medium">{item.source}</span>
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div className="flex items-center shrink-0">
                                            <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="w-80 shrink-0 space-y-6 hidden lg:block">
                    {/* Practice MCQs Card */}
                    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Practice MCQs of {formatDate(selectedDate).split("'")[0]}</h3>
                                <div className="flex items-center gap-2 mt-1 text-blue-100 text-sm">
                                    <div className="flex -space-x-2">
                                        {['🧑‍💼', '👨‍🎓', '👩‍💻'].map((emoji, i) => (
                                            <span key={i} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                                                {emoji}
                                            </span>
                                        ))}
                                    </div>
                                    <span>3200+ already attempted</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => window.location.href = '/mcq-practice'}
                            className="w-full mt-4 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors"
                        >
                            Practice Now
                        </button>
                    </Card>

                    {/* Daily Progress Calendar */}
                    <Card className="p-5">
                        <h3 className="font-bold text-gray-900 mb-4">Daily Progress</h3>

                        <div className="text-center mb-3">
                            <span className="font-semibold text-gray-700">{calendar.month}</span>
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center text-xs">
                            {['Su', 'M', 'T', 'W', 'Th', 'F', 'S'].map(day => (
                                <div key={day} className="text-gray-400 font-medium py-1">{day}</div>
                            ))}
                            {calendar.days.map((day, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "py-1.5 rounded-lg text-sm",
                                        day === todayDate && "bg-blue-600 text-white font-bold",
                                        day && day < todayDate && day > todayDate - 7 && "text-green-600",
                                        day && day < todayDate - 6 && "text-gray-300",
                                        !day && "invisible"
                                    )}
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <CheckCircle2 size={12} className="text-green-500" /> Completed
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock size={12} className="text-amber-500" /> In Progress
                            </div>
                            <div className="flex items-center gap-1">
                                <Circle size={12} className="text-gray-300" /> Not Started
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}
