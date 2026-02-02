import { useState } from 'react';
import {
    LayoutDashboard, Upload, FileText, Newspaper,
    LogOut, Plus, Check, X, File, Loader2
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:block">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold">A</div>
                        <span className="font-bold text-gray-900">Admin Panel</span>
                    </div>

                    <nav className="space-y-1">
                        <NavItem
                            icon={<LayoutDashboard size={20} />}
                            label="Overview"
                            active={activeTab === 'overview'}
                            onClick={() => setActiveTab('overview')}
                        />
                        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase">Content</div>
                        <NavItem
                            icon={<FileText size={20} />}
                            label="Upload Books"
                            active={activeTab === 'books'}
                            onClick={() => setActiveTab('books')}
                        />
                        <NavItem
                            icon={<Newspaper size={20} />}
                            label="Current Affairs"
                            active={activeTab === 'news'}
                            onClick={() => setActiveTab('news')}
                        />
                        <NavItem
                            icon={<Upload size={20} />}
                            label="Magazines"
                            active={activeTab === 'magazines'}
                            onClick={() => setActiveTab('magazines')}
                        />
                    </nav>

                    <div className="absolute bottom-6 left-6 right-6">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                        >
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 capitalize">{activeTab}</h1>
                        <p className="text-gray-500 text-sm">Manage your platform content</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-900">Admin User</span>
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
                            A
                        </div>
                    </div>
                </header>

                {activeTab === 'overview' && <OverviewStats />}
                {activeTab === 'books' && <UploadContent type="Book" />}
                {activeTab === 'magazines' && <UploadContent type="Magazine" />}
                {activeTab === 'news' && <NewsEditor />}
            </main>
        </div>
    );
}

function NavItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

function OverviewStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard label="Total Users" value="1,248" change="+12% this week" />
            <StatsCard label="Tests Attempted" value="856" change="+5% today" />
            <StatsCard label="Content Uploads" value="142" change="12 new" />
        </div>
    );
}

function StatsCard({ label, value, change }) {
    return (
        <Card className="p-6">
            <h3 className="text-gray-500 text-sm font-medium mb-2">{label}</h3>
            <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-sm text-green-600 font-medium">{change}</div>
        </Card>
    );
}

// NEW: Import supabase client
import { supabase } from '../../lib/supabaseClient';
import { api } from '../../lib/api';

// Initialize Supabase (Use keys from environment)
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

function UploadContent({ type }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [formData, setFormData] = useState({ title: '', subject: 'Polity', category: 'Standard Books' });

    const handleSync = async () => {
        if (!confirm("Only use this AFTER you have bulk uploaded files to Supabase 'ebooks' bucket. Continue?")) return;
        setSyncing(true);
        try {
            const result = await api.custom('/library/sync', 'POST');
            alert(result.message || 'Sync Complete');
        } catch (e) {
            alert('Sync failed: ' + e.message);
        }
        setSyncing(false);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        setUploading(true);
        // ... existing upload logic ...

        try {
            // 1. Upload File to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const { data, error } = await supabase.storage
                .from('ebooks')
                .upload(fileName, file);

            if (error) throw error;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('ebooks')
                .getPublicUrl(fileName);

            // 3. Save Metadata to Database (via Backend API)
            await api.custom('/library', 'POST', {
                title: formData.title,
                file_url: publicUrl,
                category: formData.category,
                subject: formData.subject,
                description: `Uploaded via Admin Panel`
            });

            alert(`Successfully uploaded ${formData.title}!`);
            setFile(null);
            setFormData({ ...formData, title: '' });

        } catch (error) {
            console.error(error);
            alert('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="max-w-2xl">
            <Card className="p-8">
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className="text-xs flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-bold uppercase tracking-wide"
                    >
                        {syncing ? <Loader2 className="w-3 h-3 animate-spin" /> : '🔄'}
                        {syncing ? 'Syncing...' : 'Sync from Cloud'}
                    </button>
                </div>

                <form onSubmit={handleUpload} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Title</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black/5 outline-none"
                            placeholder={`Enter ${type} title`}
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Subject</label>
                            <select className="w-full px-4 py-2 border rounded-lg outline-none bg-white">
                                <option>Polity</option>
                                <option>History</option>
                                <option>Economy</option>
                                <option>Environment</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">Tag</label>
                            <input type="text" className="w-full px-4 py-2 border rounded-lg outline-none" placeholder="e.g. GS-2" />
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center transition-colors hover:border-black/20">
                        {file ? (
                            <div className="flex items-center justify-center gap-3 text-green-600 font-medium bg-green-50 py-2 rounded-lg">
                                <File size={20} />
                                {file.name}
                                <button type="button" onClick={() => setFile(null)} className="p-1 hover:bg-green-100 rounded-full">
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <label className="cursor-pointer block">
                                <Upload className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                <span className="text-gray-900 font-medium">Click to upload PDF</span>
                                <input type="file" className="hidden" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
                                <p className="text-xs text-gray-500 mt-2">PDF, max 50MB</p>
                            </label>
                        )}
                    </div>

                    <button
                        disabled={uploading}
                        className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                        {uploading ? <Loader2 className="animate-spin" /> : <Upload size={18} />}
                        {uploading ? 'Uploading...' : 'Publish Content'}
                    </button>
                </form>
            </Card>
        </div>
    );
}

import ArticleReader from '../../components/ArticleReader';

// Duplicate import removed

function NewsEditor() {
    const [previewMode, setPreviewMode] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [article, setArticle] = useState({
        title: "",
        content: ""
    });

    // Helper: Smart Formatter - Now handles "soft" headers!
    const formatContent = (text) => {
        if (!text) return "";
        return text.split('\n').map(line => {
            const trimmed = line.trim();
            if (!trimmed) return "";

            // 1. Explicit Styles
            if (trimmed.startsWith('|') || trimmed.match(/^(Topic|Subject):/i)) {
                return `<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
                    <span class="text-blue-600 font-black">|</span> ${trimmed.replace('|', '').trim()}
                </h2>`;
            }

            // 2. Soft Header Detection (The "Copy Paste" Logic)
            // Detect lines that look like titles: Short, no period at end, Title Case or specific keywords
            const isShort = trimmed.length < 80;
            const hasNoPunctuation = !/[.,;]$/.test(trimmed);
            const isTitleLike = /^[A-Z][a-zA-Z0-9\s\-\&]+$/.test(trimmed) ||
                /^(Introduction|Conclusion|Way Forward|Analysis|Impact|Key Challenges|Background)/i.test(trimmed);

            if (isShort && (hasNoPunctuation || isTitleLike)) {
                return `<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
                    <span class="text-blue-600 font-black">|</span> ${trimmed}
                </h2>`;
            }

            // 3. Lists
            if (trimmed.match(/^[-•\d+\.]\s/)) {
                return `<li class="ml-4 list-disc text-gray-700 mb-2 pl-2">${trimmed.replace(/^[-•\d+\.]\s*/, '')}</li>`;
            }

            // 4. Paragraphs
            return `<p class="text-gray-700 leading-relaxed mb-4">${trimmed}</p>`;
        }).join('');
    };

    const handlePublish = async () => {
        if (!article.title || !article.content) {
            alert("Title and content are required");
            return;
        }

        setPublishing(true);
        // Transform content before saving
        const formattedContent = formatContent(article.content);

        try {
            await api.saveNews({
                title: article.title,
                content: formattedContent, // HTML content is sent
                summary: article.content.substring(0, 150) + "...",
                source: "Adda247 Editorial",
                category: "Editorial",
                gs_tags: ["GS 2", "Polity"],
                date: new Date().toISOString().split('T')[0]
            });
            alert("Successfully published!");
            setArticle({ title: "", content: "" });
        } catch (error) {
            alert("Failed to publish: " + error.message);
        }
        setPublishing(false);
    };

    // Helper to get preview content dynamically
    const getPreviewContent = () => {
        if (!article.content) return "";
        return article.content.split('\n').map(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('|') || trimmed.match(/^[A-Z\s]+:/)) {
                return `<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
                    <span class="text-blue-600 font-black">|</span> ${trimmed.replace('|', '').trim()}
                </h2>`;
            }
            if (trimmed.startsWith('•') || trimmed.startsWith('- ')) {
                return `<li class="ml-4 list-disc text-gray-700 mb-2">${trimmed.replace(/^[•-]\s*/, '')}</li>`;
            }
            if (trimmed.length > 0) return `<p class="text-gray-700 leading-relaxed mb-4">${trimmed}</p>`;
            return '';
        }).join('');
    };

    return (
        <div className="max-w-4xl">
            {previewMode && (
                <ArticleReader
                    article={{
                        ...article,
                        content: getPreviewContent(), // Use formatted content for preview
                        category: 'Preview',
                        source: 'Admin Draft',
                        date: new Date().toISOString()
                    }}
                    onClose={() => setPreviewMode(false)}
                />
            )}

            <Card className="p-6">
                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="Article Headline"
                        className="w-full text-2xl font-bold border-b border-gray-200 pb-2 outline-none"
                        value={article.title}
                        onChange={(e) => setArticle({ ...article, title: e.target.value })}
                    />
                    <div className="relative">
                        <textarea
                            className="w-full h-96 p-4 bg-gray-50 rounded-xl outline-none resize-none font-sans leading-relaxed"
                            placeholder="Paste your content here (Text with '| Header' will be auto-formatted!)..."
                            value={article.content}
                            onChange={(e) => setArticle({ ...article, content: e.target.value })}
                        ></textarea>
                        <div className="absolute top-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded border">
                            Auto-Formatting Active ✨
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => setPreviewMode(true)}
                            className="px-6 py-2 border border-black text-black rounded-lg font-bold hover:bg-gray-50 flex items-center gap-2"
                        >
                            <FileText size={18} /> Preview Classy View
                        </button>
                        <button
                            onClick={handlePublish}
                            disabled={publishing}
                            className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 disabled:bg-gray-400"
                        >
                            {publishing ? 'Publishing...' : 'Publish News'}
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
