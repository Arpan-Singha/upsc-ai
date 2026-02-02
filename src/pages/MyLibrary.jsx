import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import {
    BookOpen, FileText, Video, ChevronRight, ChevronDown,
    CheckCircle2, Circle, Search, Filter, Download, ExternalLink,
    Play, Sparkles, MessageSquare, Trophy, Clock, Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

import ChatSidebar from '../components/ChatSidebar';

export default function MyLibrary() {
    const navigate = useNavigate();
    const [selectedContent, setSelectedContent] = useState('complete-plan-2026');
    const [showChat, setShowChat] = useState(false);
    const [libraryBooks, setLibraryBooks] = useState([]);
    const [topics, setTopics] = useState([]);
    const [currentArticle, setCurrentArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [contentLoading, setContentLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSections, setExpandedSections] = useState({ content: true, books: true });

    // Cache for content to avoid re-fetching
    const [contentCache, setContentCache] = useState({});

    // Static Topics (Keep these for navigation)
    const STATIC_TOPICS = [
        { id: 'complete-plan-2026', title: 'Complete Plan for UPSC 2026', active: true, completed: false },
        { id: 'super-plan', title: 'SUPER 500 Plan', active: false, completed: true },
    ];

    useEffect(() => {
        // Load Topics
        setTopics(STATIC_TOPICS);
        setLoading(false);

        // Fetch Real Books from Supabase via Backend
        loadLibrary();
    }, []);

    useEffect(() => {
        if (selectedContent) {
            loadContent(selectedContent);
        }
    }, [selectedContent]);

    const loadLibrary = async () => {
        try {
            const data = await api.getLibrary();
            if (data && Array.isArray(data)) {
                setLibraryBooks(data);
            }
        } catch (e) {
            console.error("Failed to load library", e);
        }
    };

    const loadContent = async (topicId, forceRefresh = false) => {
        // STATIC OVERRIDE for Roadmap 2026
        if (topicId === 'complete-plan-2026') {
            setCurrentArticle({
                title: "Complete Plan for UPSC 2026",
                subtitle: "A comprehensive 18-month strategy to crack UPSC CSE 2026.",
                features: [
                    { icon: "📅", text: "<strong>Phase 1 (Jan-Jun 2025):</strong> Foundation Building (NCERTs + Standard Books)" },
                    { icon: "📝", text: "<strong>Phase 2 (Jul-Dec 2025):</strong> Optional Subject & Mains Answer Writing" },
                    { icon: "🚀", text: "<strong>Phase 3 (Jan-May 2026):</strong> Prelims Focused Prep & Mock Tests" },
                    { icon: "🧠", text: "<strong>Integrated Approach:</strong> Current Affairs + Static linking from Day 1" },
                    { icon: "📊", text: "<strong>Weekly Targets:</strong> Micro-goals to keep you on track" },
                    { icon: "🎓", text: "<strong>Mentorship:</strong> Regular doubt clearing sessions" }
                ],
                resources: [
                    { title: "NCERT Book List", description: "Class 6-12 Essentials", action: "Download PDF" },
                    { title: "Standard Booklist", description: "Laxmikanth, Spectrum, etc.", action: "View List" },
                    { title: "Previous Year Papers", description: "Last 10 Years Prelims & Mains", action: "Access Archive" }
                ],
                content: `
                    <h2>Introduction</h2>
                    <p>Preparing for UPSC CSE is a marathon, not a sprint. This plan is designed to build your knowledge layer by layer, ensuring you are exam-ready by May 2026.</p>
                    
                    <h3>Phase 1: Foundation (6 Months)</h3>
                    <p>Focus on understanding core concepts. Read NCERTs thoroughly. Do not rush into answer writing yet.</p>
                    <ul>
                        <li><strong>Polity:</strong> NCERT Class 11 + Laxmikanth</li>
                        <li><strong>History:</strong> NCERT Themes + Spectrum</li>
                        <li><strong>Geography:</strong> NCERT Class 11 & 12 + Atlas</li>
                    </ul>

                    <h3>Phase 2: Consolidation (6 Months)</h3>
                    <p>Start your Optional subject. verified. Join a test series for Mains answer writing practice.</p>
                `,
                toc: [
                    { id: "intro", title: "Introduction" },
                    { id: "p1", title: "Phase 1: Foundation" },
                    { id: "p2", title: "Phase 2: Consolidation" },
                    { id: "p3", title: "Phase 3: Prelims Mode" }
                ]
            });
            return;
        }

        // Use cached content if available and not forcing refresh
        if (!forceRefresh && contentCache[topicId]) {
            setCurrentArticle(contentCache[topicId]);
            return;
        }

        setContentLoading(true);
        const data = await api.getLibraryContent(topicId);
        if (data) {
            setCurrentArticle(data);
            // Cache the content for future use
            setContentCache(prev => ({ ...prev, [topicId]: data }));
        }
        setContentLoading(false);
    };

    const handleRegenerate = () => {
        // Force refresh to regenerate content
        loadContent(selectedContent, true);
    };

    const handleMarkAsRead = () => {
        console.log('Marking as read:', selectedContent);
    };

    const filteredBooks = libraryBooks.filter(book =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-6rem)] -mx-6 -my-6">
            {/* Secondary Sidebar - Content List */}
            <div className="w-72 border-r border-gray-200 bg-gray-50/50 overflow-y-auto shrink-0">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-900">CONTENT</h2>
                </div>

                <div className="p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="space-y-1 px-2">
                    {topics.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setSelectedContent(item.id)}
                            className={cn(
                                "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all text-sm",
                                selectedContent === item.id
                                    ? "bg-blue-50 text-blue-700"
                                    : "hover:bg-gray-100 text-gray-700"
                            )}
                        >
                            {item.completed ? (
                                <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                            ) : (
                                <Circle size={16} className="text-gray-300 shrink-0 mt-0.5" />
                            )}
                            <span className={cn(
                                "flex-1",
                                item.active && "font-semibold text-orange-600"
                            )}>
                                {item.title}
                                {item.active && <span className="ml-2 text-orange-500">◂</span>}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="mt-4 border-t border-gray-200 pt-4 px-2">
                    <button
                        onClick={() => setExpandedSections({ ...expandedSections, books: !expandedSections.books })}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-gray-700"
                    >
                        <span>📚 KNOWLEDGE BASE ({libraryBooks.length})</span>
                        {expandedSections.books ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {expandedSections.books && (
                        <div className="space-y-1 mt-2">
                            {filteredBooks.length === 0 && (
                                <p className="text-xs text-gray-400 px-3 py-2">No books found.</p>
                            )}
                            {filteredBooks.map((book) => (
                                <button
                                    key={book.id}
                                    onClick={() => {
                                        if (book.file_url) window.open(book.file_url, '_blank');
                                        else alert("No PDF link for this book");
                                    }}
                                    className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs hover:bg-gray-100 text-gray-600 group"
                                >
                                    <FileText size={14} className="text-blue-500 shrink-0" />
                                    <span className="truncate flex-1">{book.title}</span>
                                    {book.file_url && <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 text-gray-400" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto">
                {contentLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Generating AI Content...</p>
                            <p className="text-sm text-gray-400 mt-2">This may take a few seconds</p>
                        </div>
                    </div>
                ) : currentArticle ? (
                    <div className="max-w-3xl mx-auto p-8">
                        {/* Video Thumbnail */}
                        <div className="relative rounded-2xl overflow-hidden mb-8 group cursor-pointer bg-gradient-to-br from-blue-600 to-purple-700">
                            <div className="h-64 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                                    <Play size={28} className="text-blue-600 ml-1" />
                                </div>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 text-center text-white">
                                <span className="font-bold text-xl">Learn the Smart Way</span>
                            </div>
                        </div>

                        {/* CTA Banner */}
                        <Card className="bg-blue-50 border-blue-100 p-4 mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="text-blue-600" size={20} />
                                <span className="text-blue-800 font-medium">AI-Generated Study Guide</span>
                            </div>
                            <button
                                onClick={handleRegenerate}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-sm"
                            >
                                Regenerate
                            </button>
                        </Card>

                        {/* Article Title */}
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentArticle.title}</h1>
                        <p className="text-gray-600 mb-6">{currentArticle.subtitle}</p>

                        {/* Feature List */}
                        {currentArticle.features && currentArticle.features.length > 0 && (
                            <div className="space-y-3 mb-8">
                                {currentArticle.features.map((item, idx) => {
                                    // Handle various data structures
                                    const icon = typeof item === 'object' ? (item.icon || '✓') : '✓';
                                    const text = typeof item === 'object'
                                        ? (item.text || item.description || JSON.stringify(item))
                                        : String(item);

                                    return (
                                        <div key={idx} className="flex items-start gap-3">
                                            <span className="w-5 h-5 bg-green-100 text-green-600 rounded flex items-center justify-center text-sm shrink-0">
                                                {icon}
                                            </span>
                                            <span
                                                className="text-gray-700"
                                                dangerouslySetInnerHTML={{ __html: text }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* AI Access Banner */}
                        <Card className="bg-gray-50 p-4 mb-8 flex items-center justify-between">
                            <span className="text-gray-700">Get personalized guidance with AI</span>
                            <button
                                onClick={() => setShowChat(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                            >
                                Ask Kalam AI
                            </button>
                        </Card>

                        {/* HTML Content */}
                        {currentArticle.content && (
                            <div
                                className="prose prose-blue max-w-none mb-8"
                                dangerouslySetInnerHTML={{ __html: currentArticle.content }}
                            />
                        )}

                        {/* Important Resources Section */}
                        {currentArticle.resources && currentArticle.resources.length > 0 && (
                            <>
                                <h2 id="resources" className="text-xl font-bold text-gray-900 mb-2">Important Resources</h2>
                                <p className="text-gray-600 mb-4">AI-curated resources for your preparation.</p>

                                <div className="space-y-3 mb-8">
                                    {currentArticle.resources.map((resource, idx) => (
                                        <Card key={idx} className="bg-blue-50/50 p-4 flex items-center justify-between">
                                            <div>
                                                <span className="text-gray-800 font-medium">{resource.title}</span>
                                                {resource.description && (
                                                    <p className="text-sm text-gray-500">{resource.description}</p>
                                                )}
                                            </div>
                                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700">
                                                {resource.action || 'Access'}
                                            </button>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Community Banner */}
                        <Card className="bg-gray-50 p-4 mb-8 flex items-center justify-between">
                            <span className="text-gray-700">Join our community for daily updates</span>
                            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                                Join Now
                            </button>
                        </Card>

                        <p className="text-gray-600 text-center mb-20">Content generated by AI. More resources coming soon!</p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Select content from the sidebar</p>
                    </div>
                )}
            </div>

            {/* Right Sidebar - Table of Contents */}
            <div className="w-56 border-l border-gray-200 bg-gray-50/50 p-4 hidden xl:block shrink-0">
                <h3 className="font-bold text-gray-900 mb-4">{currentArticle?.title || 'Select a topic'}</h3>
                <p className="text-xs text-gray-500 mb-4">{currentArticle?.subtitle}</p>

                {currentArticle?.toc && (
                    <div className="space-y-2">
                        {currentArticle.toc.map((item, idx) => (
                            <a
                                key={idx}
                                href={`#${item.id}`}
                                className="block text-sm text-gray-600 hover:text-blue-600 py-1"
                            >
                                {item.title}
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Lesson Controls */}
            <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 p-4 flex items-center justify-center gap-4 z-50">
                <button
                    onClick={handleMarkAsRead}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                    <Circle size={16} /> Mark as Read
                </button>
                <button
                    onClick={() => navigate('/mcq-practice')}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                    <Sparkles size={16} /> Practice MCQs
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                    Next Lesson <ChevronRight size={16} />
                </button>
            </div>
            {/* Chat Sidebar */}
            <ChatSidebar isOpen={showChat} onClose={() => setShowChat(false)} />
        </div>
    );
}
