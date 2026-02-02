import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, Maximize2, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';

export default function BookReader() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const book = location.state?.book;
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        if (book?.file_path) {
            // Fetch document content from backend
            fetch(`http://localhost:8000/api/library/read/${id}`)
                .then(res => res.json())
                .then(data => {
                    setContent(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        } else if (book?.url && !book?.file_path) {
            // External URL - use iframe
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [id, book]);

    if (!book) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-6rem)]">
                <p className="text-gray-500 mb-4">Book not found. Go back to library.</p>
                <button
                    onClick={() => navigate('/library')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Back to Library
                </button>
            </div>
        );
    }

    const toggleFullscreen = () => {
        const elem = document.getElementById('reader-container');
        if (!document.fullscreenElement) {
            elem?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            {/* Header */}
            <header className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/library')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{book.title}</h1>
                        <p className="text-sm text-gray-500">{book.subject} • {book.type}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Fullscreen"
                    >
                        <Maximize2 size={18} />
                    </button>
                    {book.url && !book.file_path && (
                        <a
                            href={book.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Open in new tab"
                        >
                            <ExternalLink size={18} />
                        </a>
                    )}
                </div>
            </header>

            {/* Content Reader */}
            <div id="reader-container" className="flex-1 bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="flex items-center gap-3 text-gray-500">
                            <BookOpen className="animate-pulse" />
                            <span>Loading document...</span>
                        </div>
                    </div>
                ) : book.file_path && content ? (
                    // Render DOCX content as HTML
                    <div className="h-full overflow-y-auto p-8">
                        <article
                            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
                            dangerouslySetInnerHTML={{ __html: content.content }}
                        />
                    </div>
                ) : book.url ? (
                    // External URL - use iframe
                    <iframe
                        src={book.url}
                        className="w-full h-full border-0"
                        title={book.title}
                        allow="fullscreen"
                    />
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500">Content not available</p>
                    </div>
                )}
            </div>
        </div>
    );
}
