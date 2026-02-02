import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simple hardcoded check for now (Phase 1)
        // In real backend integration, this will hit /api/admin/login
        setTimeout(() => {
            if (password === 'upsc2026') {
                localStorage.setItem('admin_token', 'demo-token-active');
                navigate('/admin/dashboard');
            } else {
                setError('Invalid Access Code');
                setLoading(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                    <p className="text-gray-500">Secure access for content managers</p>
                </div>

                <Card className="p-8 shadow-xl border-gray-100">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Access Code
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all font-mono text-lg"
                                    placeholder="••••••••"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg animate-in fade-in slide-in-from-top-1">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !password}
                            className={`
                                w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white transition-all
                                ${loading ? 'bg-gray-400 cursor-wait' : 'bg-black hover:bg-gray-800 shadow-lg hover:shadow-xl'}
                            `}
                        >
                            {loading ? 'Verifying...' : 'Access Dashboard'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <a href="/" className="text-sm text-gray-400 hover:text-gray-900 transition-colors">
                            ← Back to Website
                        </a>
                    </div>
                </Card>
            </div>
        </div>
    );
}
