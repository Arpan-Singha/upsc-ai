import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, StopCircle, X, Maximize2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

export default function ChatSidebar({ isOpen, onClose }) {
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
        if (isOpen) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e && e.preventDefault();
        if (!input.trim() || isThinking) return;

        const userMsg = { role: 'user', parts: [{ text: input.trim() }] };
        setMessages(prev => [...prev, userMsg]);
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-purple-600" size={18} />
                    <h3 className="font-bold text-gray-900">Ask StudyIQ AI</h3>
                </div>
                <div className="flex gap-2">
                    {/* <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
                        <Maximize2 size={16} />
                    </button> */}
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-500">
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500 opacity-60">
                        <Sparkles size={48} className="mb-4 text-purple-300" />
                        <p className="text-sm font-medium">How can I help you with your studies today?</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={cn("flex flex-col", msg.role === 'user' ? "items-end" : "items-start")}>
                                <div className={cn(
                                    "px-4 py-2.5 rounded-2xl max-w-[90%] text-sm leading-relaxed shadow-sm",
                                    msg.role === 'user'
                                        ? "bg-purple-600 text-white rounded-br-sm"
                                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                                )}>
                                    {msg.parts?.[0]?.text}
                                </div>
                                {msg.role === 'model' && (
                                    <span className="text-[10px] text-gray-400 mt-1 ml-1">StudyIQ AI</span>
                                )}
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex items-center gap-2 text-gray-400 text-xs ml-2">
                                <Sparkles size={12} className="animate-spin text-purple-500" /> Thinking...
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a doubt..."
                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-300 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isThinking}
                        className={cn(
                            "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all",
                            input.trim() ? "bg-purple-600 text-white hover:bg-purple-700" : "bg-gray-200 text-gray-400"
                        )}
                    >
                        {isThinking ? <StopCircle size={14} className="animate-pulse" /> : <Send size={14} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
