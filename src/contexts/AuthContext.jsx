import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

import { api } from '../lib/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkUser = async () => {
        try {
            const data = await api.getMe(); // Check Backend Session
            setUser(data?.user || null);
        } catch (e) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUser();
    }, []);

    const value = {
        user,
        loading,
        signInWithGoogle: () => {
            // Redirect to Backend Auth
            window.location.href = 'http://localhost:3000/auth/google';
        },
        signOut: async () => {
            await api.logout();
            setUser(null);
            window.location.href = '/';
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
