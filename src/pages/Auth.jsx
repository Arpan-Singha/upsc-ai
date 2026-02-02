import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Chrome, Lock, Rocket } from 'lucide-react';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            signInWithGoogle(); // Redirects to backend
        } catch (e) {
            console.error("Login failed", e);
            setError(e.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12 w-full max-w-md text-center relative overflow-hidden">

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 p-32 bg-indigo-50 rounded-full blur-3xl translate-x-10 -translate-y-10 opacity-60 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 p-24 bg-orange-50 rounded-full blur-3xl -translate-x-10 translate-y-10 opacity-60 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 transform hover:rotate-6 transition-all">
                        <Rocket className="text-white" size={32} />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to UPSC.AI</h1>
                    <p className="text-gray-500 mb-8">Sign in to save your progress, unlock badges, and track your daily streak.</p>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-6 border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-medium py-3.5 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
                    >
                        {loading ? (
                            <span className="animate-spin w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"></span>
                        ) : (
                            <>
                                <Chrome size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
                                <span>Continue with Google</span>
                            </>
                        )}
                    </button>

                    <div className="mt-8 pt-8 border-t border-gray-100 text-xs text-gray-400">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Lock size={12} />
                            <span>Secure Authentication via Supabase</span>
                        </div>
                        By continuing, you agree to our Terms & Conditions.
                    </div>
                </div>
            </div>
        </div>
    );
}
