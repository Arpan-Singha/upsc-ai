import { Send, Sparkles, StopCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export default function AskKalam() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const bottomRef = useRef(null);

    // Load chat from session storage on mount
    useEffect(() => {
        const savedChat = sessionStorage.getItem('StudyIQ AI_chat_session');
        if (savedChat) {
            try {
                setMessages(JSON.parse(savedChat));
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        }
    }, []);

    // Save chat to session storage whenever it changes
    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem('StudyIQ AI_chat_session', JSON.stringify(messages));
        }
    }, [messages]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isThinking) return;

        const userMessage = { role: 'user', parts: [{ text: input }] };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsThinking(true);

        try {
            const response = await api.sendChat(currentInput, messages);
            if (response && response.response) {
                setMessages(prev => [...prev, { role: 'model', parts: [{ text: response.response }] }]);
            } else {
                setMessages(prev => [...prev, { role: 'model', parts: [{ text: "I couldn't get a response. Please try again." }] }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Sorry, I'm having trouble connecting right now." }] }]);
        } finally {
            setIsThinking(false);
        }
    };

    const handleTagClick = (tag) => {
        setInput(tag);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="text-purple-600" />
                    Ask StudyIQ AI
                </h1>
                <p className="text-gray-500 mt-2 text-lg">Your Personal AI Mentor for UPSC Preparation.</p>
            </header>

            <Card className="flex-1 flex flex-col p-0 overflow-hidden bg-white/50 relative">
                {/* Chat Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center">
                            <div className="max-w-md animate-in fade-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 mx-auto shadow-xl shadow-blue-500/20">
                                    <Sparkles size={40} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">How can I help you today?</h2>
                                <p className="text-gray-500 mb-8">Ask me anything about UPSC topics, current affairs, or strategy.</p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {['Explain Article 21', 'Summary of G20 Summit', 'Strategy for Prelims', 'Economy Syllabus'].map((tag) => (
                                        <button key={tag} onClick={() => handleTagClick(tag)} className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm transition-all hover:scale-105">
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    <div className={cn(
                                        "max-w-2xl px-5 py-3 rounded-2xl",
                                        msg.role === 'user'
                                            ? "bg-purple-600 text-white rounded-br-none"
                                            : "bg-white border border-gray-200 shadow-sm text-gray-800 rounded-bl-none"
                                    )}>
                                        {msg.role === 'model' && <span className="font-bold text-purple-600 block mb-1 text-xs uppercase tracking-wider">StudyIQ AI</span>}
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.parts?.[0]?.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isThinking && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-200 shadow-sm text-gray-800 rounded-2xl rounded-bl-none px-5 py-3">
                                        <span className="font-bold text-purple-600 block mb-1 text-xs uppercase tracking-wider">StudyIQ AI</span>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                    <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask your doubt here..."
                            className="w-full pl-6 pr-16 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-lg shadow-inner"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isThinking}
                            className={cn("absolute right-3 top-3 p-2 rounded-xl transition-all",
                                input.trim() && !isThinking ? "bg-purple-600 text-white shadow-md hover:bg-purple-700" : "bg-gray-200 text-gray-400"
                            )}
                        >
                            {isThinking ? <StopCircle size={24} className="animate-pulse" /> : <Send size={24} />}
                        </button>
                    </form>
                    <div className="text-center mt-3 text-xs text-gray-400">
                        AI can make mistakes. Verify important information.
                    </div>
                </div>
            </Card>
        </div>
    );
}
